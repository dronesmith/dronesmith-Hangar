

import random
from time import *


# Connect to the Vehicle
vehicle = connect(__DRONE__, wait_ready=True)

print "Sending RGB Command"
sys.stdout.flush()

vehicle._rgbled.color((1.0, 0.0, 1.0))

vehicle.mode    = VehicleMode("GUIDED")
vehicle.armed   = True
sleep(1)

print "Taking off!"
sys.stdout.flush()
vehicle.simple_takeoff(2)

#Close vehicle object before exiting script
print "Close vehicle object"
sys.stdout.flush()
sleep(5)
vehicle.close()
