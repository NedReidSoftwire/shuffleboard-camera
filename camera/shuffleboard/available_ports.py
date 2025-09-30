import subprocess
import platform
import re
from typing import List, Dict, Optional

def list_ports() -> List[Dict[str, str]]:
    """Return a list of available cameras with their indices and names.

    Uses platform-specific command-line tools to detect cameras:
    - macOS: ffmpeg with avfoundation
    - Windows: PowerShell Win32_PnPEntity query
    - Linux: v4l2-ctl

    Returns:
        List of dictionaries with 'port' and 'name' keys.
        Example: [{'port': '0', 'name': 'FaceTime HD Camera'}]
    """
    system = platform.system()
    
    if system == "Darwin":  # macOS
        return _list_ports_macos()
    elif system == "Windows":
        return _list_ports_windows()
    elif system == "Linux":
        return _list_ports_linux()
    else:
        raise NotImplementedError(f"Camera detection not implemented for {system}")


def _list_ports_macos() -> List[Dict[str, str]]:
    """List camera ports on macOS using ffmpeg."""
    try:
        # Run ffmpeg command to list devices
        cmd = ['ffmpeg', '-f', 'avfoundation', '-list_devices', 'true', '-i', '']
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        # Parse output - devices are listed in stderr (now captured in stdout)
        output = result.stdout
        cameras = []
        
        # Extract video devices section
        in_video_section = False
        for line in output.split('\n'):
            if 'video devices:' in line.lower():
                in_video_section = True
                continue
            if 'audio devices:' in line.lower():
                in_video_section = False
                break
            
            if in_video_section:
                # Match pattern like "[0] FaceTime HD Camera"
                match = re.search(r'\[(\d+)\]\s+(.+)', line)
                if match:
                    port = match.group(1)
                    name = match.group(2).strip()
                    cameras.append({'port': port, 'name': name})
        
        return cameras
    except FileNotFoundError:
        raise RuntimeError("ffmpeg not found. Please install ffmpeg to detect cameras on macOS.")
    except Exception as e:
        raise RuntimeError(f"Error detecting cameras on macOS: {e}")


def _list_ports_windows() -> List[Dict[str, str]]:
    """List camera ports on Windows using PowerShell."""
    try:
        # PowerShell command to list USB video devices
        cmd = [
            'powershell', '-Command',
            'Get-CimInstance Win32_PnPEntity | Where-Object { $_.service -eq "usbvideo" } | Select-Object -Property PNPDeviceID, Name | ConvertTo-Json'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        import json
        devices = json.loads(result.stdout)
        
        # Handle single device case (not a list)
        if isinstance(devices, dict):
            devices = [devices]
        
        cameras = []
        for idx, device in enumerate(devices):
            # Use index as port since Windows doesn't provide direct port mapping
            cameras.append({
                'port': str(idx),
                'name': device.get('Name', 'Unknown Camera')
            })
        
        return cameras
    except Exception as e:
        raise RuntimeError(f"Error detecting cameras on Windows: {e}")


def _list_ports_linux() -> List[Dict[str, str]]:
    """List camera ports on Linux using v4l2-ctl."""
    try:
        # Run v4l2-ctl command
        cmd = ['v4l2-ctl', '--list-devices']
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        cameras = []
        current_device_name = None
        
        for line in result.stdout.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # Device names don't start with /dev/
            if not line.startswith('/dev/'):
                # Extract device name (remove trailing colon and USB info in parentheses)
                current_device_name = re.sub(r'\s*\([^)]*\):\s*$', '', line).strip()
            else:
                # This is a device path like /dev/video0
                match = re.search(r'/dev/video(\d+)', line)
                if match and current_device_name:
                    port = match.group(1)
                    cameras.append({
                        'port': port,
                        'name': current_device_name
                    })
        
        return cameras
    except FileNotFoundError:
        raise RuntimeError("v4l2-ctl not found. Please install v4l-utils to detect cameras on Linux.")
    except Exception as e:
        raise RuntimeError(f"Error detecting cameras on Linux: {e}")


if __name__ == "__main__":
    print("Detected camera ports:", list_ports())