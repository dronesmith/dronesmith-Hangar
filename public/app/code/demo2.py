#
# Simple script to change the color of the RGBLED depending on the orientation of the
# drone. 
#

import sys

import random
from time import *

# Connect to the Vehicle
vehicle = connect(__DRONE__, wait_ready=True)

print "Changing RGB depending on rotation"
for i in range(20):

    vehicle._rgbled.on()

    if vehicle.attitude.roll < -1:
       vehicle._rgbled.color((1.0, 0.0, 0.0))
    elif vehicle.attitude.roll > 1:
       vehicle._rgbled.color((0.0, 1.0, 0.0))
    else:
       vehicle._rgbled.color((0.0, 0.0, 1.0))
    sleep(.5)

print "Switch to normal behavior."
vehicle._rgbled.setDefault()

# Close vehicle object
print "Close vehicle object"
vehicle.close()
