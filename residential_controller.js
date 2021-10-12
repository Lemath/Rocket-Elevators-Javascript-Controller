class Column {
    constructor(_id, _amountOfFloors, _amountOfElevators) {
        this.ID = _id;
        this.status = 'online';
        this.amountOfFloors = _amountOfFloors;
        this.amountOfElevators = _amountOfElevators;
        this.elevatorList = [];
        this.callButtonList = [];
        this.createElevators();
        this.createCallButtons();
    }

    createCallButtons() {  //made mod cause template reused too much unnessesary argument so if test fail might be culprit but dont think so
        let buttonFloor = 1;
        let callButtonID = 1;
        let callButton;
        for (let i = 0; i < this.amountOfFloors; i++) {
            if (buttonFloor < this.amountOfFloors) {
                callButton = new CallButton(callButtonID, 'OFF', buttonFloor, 'up');
                this.callButtonList.push(callButton);
            }
            if (buttonFloor > 1) {
                callButton = new CallButton(callButtonID, 'OFF', buttonFloor, 'down');
                this.callButtonList.push(callButton);
            }
            callButtonID++;
            buttonFloor++;
        }
    }

    createElevators() {
        let elevatorID = 1;
        let elevator;
        for (let i = 0; i < this.amountOfElevators; i++) {
            elevator = new Elevator(elevatorID, this.amountOfFloors, 'idle', 1);
            this.elevatorList.push(elevator);
            elevatorID++;
        }
    }

    requestElevator(floor, direction) {
        let bestElevator = this.findElevator(floor, direction);
        bestElevator.floorRequestList.push(floor);
        bestElevator.move();
        bestElevator.operateDoors();
        return bestElevator;
    }

  

    findElevator(requestedFloor, requestedDirection) {
        let bestElevator = {
            elevator: null,
            score: 5,
            referenceGap: 10000000
        };
        this.elevatorList.forEach(function(elevator) {
            let score = 4;
            if (requestedFloor == elevator.currentFloor && elevator.status == 'stop' && requestedDirection == elevator.direction) {
                score = 1;
            } else if (requestedFloor > elevator.currentFloor && elevator.direction == 'up' && requestedDirection == elevator.direction) {
                score = 2;
            } else if (requestedFloor < elevator.currentFloor && elevator.direction == 'down' && requestedDirection == elevator.direction) {
                score = 2;
            } else if (elevator.status == 'idle') {
                score = 3;
            }
            
            bestElevator = elevator.checkIfElevatorIsBetter(score, bestElevator, requestedFloor);
        });
        return bestElevator.elevator;
    }

    

}

class Elevator {
    constructor(_id, _amountOfFloors, _status, _currentFloor) 
    {
        this.ID = _id;
        this.status = _status;
        this.amountOfFloors = _amountOfFloors;
        this.currentFloor = _currentFloor;
        this.direction = null;
        this.door = new Door(this.ID, 'closed');
        this.floorRequestButtonList = [];
        this.floorRequestList = [];
        this.createFloorRequestButtons();
    }

    createFloorRequestButtons() 
    {
        let buttonFloor = 1;
        let floorRequestButtonID = 1;
        for (let i = 0; i < this.amountOfFloors; i++) {
            this.floorRequestButtonList.push(new FloorRequestButton(floorRequestButtonID, 'OFF', buttonFloor));
            buttonFloor++;
            floorRequestButtonID++;
        }
    }

    checkIfElevatorIsBetter(scoreToCheck, bestElevator, floor) {
        console.log(bestElevator)
        if (scoreToCheck < bestElevator.score) {
            bestElevator.score = scoreToCheck;
            bestElevator.elevator = this;
            bestElevator.referenceGap = Math.abs(this.currentFloor - floor);
        } else if (scoreToCheck == bestElevator.score) {
            let gap = Math.abs(this.currentFloor - floor);
            if (bestElevator.referenceGap > gap) {
                bestElevator.elevator = this;
                bestElevator.referenceGap = gap;
            }
        }
        console.log(bestElevator)
        return bestElevator;
    }

    requestFloor(floor) 
    {
        this.floorRequestList.push(floor);
        this.move();
        this.operateDoors();
    }

    move() 
    {
        while (this.floorRequestList.length > 0) {
            let destination = this.floorRequestList.shift();
            this.status = 'moving';
            if (this.currentFloor < destination) {
                this.direction = 'up';
                this.sortFloorList();
                while (this.currentFloor < destination) {
                    this.currentFloor++;
                    this.screenDisplay = this.currentFloor;
                }
            } else if (this.currentFloor > destination) {
                this.direction = 'down';                
                this.sortFloorList();
                while (this.currentFloor > destination) {
                    this.currentFloor--;
                    this.screenDisplay = this.currentFloor;
                }
            }
            this.status = 'stop';
        }
        this.status = 'idle';
    }

    sortFloorList() 
    {
        if (this.direction == 'up') {
            this.floorRequestList.sort((a, b) => a - b);
        } else {
            this.floorRequestList.sort((a, b) => b - a);
        }
    }

    operateDoors() 
    {
        this.door.status = 'opened';
        // Wait 5 Seconds
        if (!this.isOverweight()) {
            this.door.status = 'closing';
            if(!this.door.isObstructed()) 
            {                    
                this.door.status = 'closed';
            } else {
                this.operateDoors();
            }
        } else {
            while (isOverweight()) {
                this.overweightAlarm = true;
            }
            this.overweightAlarm = false;
            this.operateDoors();
        }
        
    }

    isOverweight() {
        return false;
    }
}

class CallButton {
    constructor(_id, _floor, _direction, _status) {
        this.ID = _id;
        this.floor = _floor;
        this.direction = _direction;
        this.status = _status;
    }
}

class FloorRequestButton {
    constructor(_id, _floor, _status) {
        this.ID = _id;
        this.floor = _floor;
        this.status = _status;
    }
}

class Door {
    constructor(_id, _status) {
        this.ID = _id;
        this.status = _status;
    }

    isObstructed() {
        return false;
    }
}

//let column = new Column(1, 10, 2)
//console.log(column) 

module.exports = { Column, Elevator, CallButton, FloorRequestButton, Door };