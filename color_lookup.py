import sys 
from webcolors import name_to_hex, name_to_rgb
import re

#take in arguments
color=sys.argv[1]

#function to translate color names to rgb values
def color_info(color_name):
    try:
        rgb_value = name_to_rgb(color_name)
        rgb_value=str(rgb_value)
        x = re.findall(r"\d{1,3}", rgb_value)
        print (x)
        
    except ValueError:
        print ("err")

color_info(color)
