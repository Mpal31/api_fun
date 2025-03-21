import sys 
from webcolors import name_to_hex, name_to_rgb
import re

color=sys.argv[1]
#print(color)
def color_info(color_name):
    try:
#        hex_value = name_to_hex(color_name)
        rgb_value = name_to_rgb(color_name)
        rgb_value=str(rgb_value)
 #       print (rgb_value)
        #rgb_value=str(rgb_value)
        x = re.findall("\d{1,3}", rgb_value)
        print (x)
#        f=re.findall("[^[]']",x)
 #       print (f)
    except ValueError:
        print ("Color name not recognized. Please try another color.")

color_info(color)


# Example usage
#print(name_to_rgb("blue"))
