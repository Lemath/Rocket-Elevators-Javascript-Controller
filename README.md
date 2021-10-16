# Rocket-Elevators-Javascript-Controller

### Description

This program serve as an elevator controller for application in the residential department, coded in Javascript

#### Exemple:

On a request call from any floor of the building, the controller will first select the best elevator available.
Selection is based on the status, direction and distance of each elevator to the target floor.
Once an elevator have been selected, it is sent to the corresponding floor to pick up the user and move him to the floor of his choice

### Test

To test the controller with Node JS and NPM installed, first run:

`npm install`

and then, to run the tests:

`npm test`

