import logging
import sys
from os import path

def setup_logger(name):
    logger = logging.getLogger(path.basename(name))
    logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    
    # File handler
    file_handler = logging.FileHandler('shuffleboard_camera.log')
    file_handler.setLevel(logging.INFO)
    
    # Format
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    # logger.addHandler(file_handler)
    
    return logger
