import os
import tempfile
import subprocess
import logging
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
from django.conf import settings

logger = logging.getLogger(__name__)

def trim_video_to_60_seconds(video_file):
    """
    Trim video file to first 60 seconds using FFmpeg
    Returns a File object with the trimmed video
    """
    temp_input_path = None
    temp_output_path = None
    
    try:
        # Create a temporary file for the input
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_input:
            for chunk in video_file.chunks():
                temp_input.write(chunk)
            temp_input_path = temp_input.name
        
        # Create a temporary file for the output
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_output:
            temp_output_path = temp_output.name
        
        # First try: Use copy codecs (faster, no re-encoding)
        try:
            cmd = [
                'ffmpeg', '-i', temp_input_path,
                '-t', '60',  # Duration limit
                '-c', 'copy',  # Copy codecs (faster)
                '-avoid_negative_ts', 'make_zero',  # Handle negative timestamps
                '-y',  # Overwrite output
                temp_output_path
            ]
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            logger.info(f"Video trimmed successfully using copy codecs")
            
        except subprocess.CalledProcessError as e:
            logger.warning(f"Copy codecs failed: {e.stderr}, trying re-encode")
            
            # Second try: Re-encode with specific codecs
            try:
                cmd = [
                    'ffmpeg', '-i', temp_input_path,
                    '-t', '60',  # Duration limit
                    '-c:v', 'libx264',  # Video codec
                    '-c:a', 'aac',  # Audio codec
                    '-preset', 'fast',  # Faster encoding
                    '-crf', '23',  # Good quality
                    '-avoid_negative_ts', 'make_zero',
                    '-y',  # Overwrite output
                    temp_output_path
                ]
                subprocess.run(cmd, check=True, capture_output=True, text=True)
                logger.info(f"Video trimmed successfully using re-encode")
                
            except subprocess.CalledProcessError as e:
                logger.error(f"Re-encode also failed: {e.stderr}")
                raise Exception(f"Failed to trim video: {e.stderr}")
        
        # Verify the output file exists and has content
        if not os.path.exists(temp_output_path) or os.path.getsize(temp_output_path) == 0:
            raise Exception("Trimmed video file is empty or doesn't exist")
        
        # Verify the video file is valid using ffprobe
        try:
            verify_cmd = [
                'ffprobe', '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                temp_output_path
            ]
            verify_result = subprocess.run(verify_cmd, capture_output=True, text=True, check=True)
            logger.info(f"Video file verified successfully")
        except subprocess.CalledProcessError as e:
            logger.error(f"Video file verification failed: {e.stderr}")
            raise Exception("Trimmed video file is corrupted")
        
        # Read the trimmed video and create a File object
        with open(temp_output_path, 'rb') as f:
            trimmed_file = File(f, name=video_file.name)
        
        return trimmed_file
        
    except Exception as e:
        logger.error(f"Error trimming video: {e}")
        # Return original file if trimming fails
        return video_file
        
    finally:
        # Clean up temporary files
        if temp_input_path and os.path.exists(temp_input_path):
            try:
                os.unlink(temp_input_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp input file: {e}")
        
        if temp_output_path and os.path.exists(temp_output_path):
            try:
                os.unlink(temp_output_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp output file: {e}")

def get_video_duration(video_file):
    """
    Get video duration using FFmpeg
    Returns duration in seconds
    """
    temp_path = None
    
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            for chunk in video_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name
        
        # Get video duration using FFmpeg
        cmd = [
            'ffprobe', '-v', 'quiet',
            '-show_entries', 'format=duration',
            '-of', 'csv=p=0',
            temp_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        duration = float(result.stdout.strip())
        
        return duration
        
    except Exception as e:
        logger.error(f"Error getting video duration: {e}")
        return 0
        
    finally:
        # Clean up
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp duration file: {e}")

def should_trim_video(video_file):
    """
    Check if video should be trimmed (longer than 60 seconds)
    """
    duration = get_video_duration(video_file)
    return duration > 60

def is_video_file(file):
    """
    Check if uploaded file is a video
    """
    video_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    video_mime_types = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 
                       'video/x-flv', 'video/webm', 'video/x-matroska']
    
    # Check file extension
    file_name = file.name.lower()
    if any(file_name.endswith(ext) for ext in video_extensions):
        return True
    
    # Check MIME type
    if hasattr(file, 'content_type') and file.content_type:
        if any(mime_type in file.content_type.lower() for mime_type in video_mime_types):
            return True
    
    return False

def validate_video_file(video_file):
    """
    Validate video file using ffprobe
    Returns True if valid, False otherwise
    """
    temp_path = None
    
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            for chunk in video_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name
        
        # Validate using ffprobe
        cmd = [
            'ffprobe', '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            temp_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        return True
        
    except Exception as e:
        logger.error(f"Video file validation failed: {e}")
        return False
        
    finally:
        # Clean up
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp validation file: {e}") 