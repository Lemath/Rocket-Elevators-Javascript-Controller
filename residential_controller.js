var elevatorID = 1;
var floorRequestButtonID = 1;
var callButtonID = 1;
class Column {
    constructor(_id, _amountOfFloors, _amountOfElevators, _status='online') {
        this.ID = _id;
        this.status = _status;
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
                callButton = new CallButton(callButtonID, 'OFF', buttonFloor, 'Down');
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
        let bestElevator;
        let bestScore = 5;
        let referenceGap = 10000000;
        let bestElevatorInformations;
        this.elevatorList.forEach(function(elevator) {
            let score = 4;
            if (requestedFloor == elevator.currentFloor && elevator.status == 'stop' && requestedDirection == elevator.direction) {
                score = 1;
            } else if (requestedFloor > elevator.currentFloor && elevator.direction == 'up' && requestedDirection == elevator.direction) {
                score = 2;
            } else if (requestedFloor < elevator.currentFloor && elevator.direction == 'Down' && requestedDirection == elevator.direction) {
                score = 2;
            } else if (elevator.status == 'idle') {
                score = 3;
            }
            bestElevatorInformations = elevator.checkIfElevatorIsBetter(score, bestScore, referenceGap, bestElevator, requestedFloor);
            bestElevator = bestElevatorInformations.bestElevator;
            bestScore = bestElevatorInformations.bestScore;
            referenceGap = bestElevatorInformations.referenceGap;
        });
        return bestElevator;
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
        this.createFloorRequestButtons(this.amountOfFloors);
    }

    createFloorRequestButtons(amountOfFloors) 
    {
        let buttonFloor = 1;
        let floorRequestButtonID = 1;
        for (let i = 0; i < amountOfFloors; i++) {
            this.floorRequestButtonList.push(new FloorRequestButton(floorRequestButtonID, 'OFF', buttonFloor));
            buttonFloor++;
            floorRequestButtonID++;
        }
    }

    checkIfElevatorIsBetter(scoreToCheck, bestScore, referenceGap, bestElevator, floor) {

        if (scoreToCheck < bestScore) {
            bestScore = scoreToCheck;
            bestElevator = this;
            referenceGap = Math.abs(this.currentFloor - floor);
        } else if (scoreToCheck == bestScore) {
            let gap = Math.abs(this.currentFloor - floor);
            if (referenceGap > gap) {
                bestElevator = this;
                referenceGap = gap;
            }
        }
        return {
            bestElevator: bestElevator,
            bestScore: bestScore,
            referenceGap: referenceGap 
        };
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
                this.direction = 'Down';
                this.sortFloorList();
                while (this.currentFloor > destination) {
                    this.currentFloor--;
                    this.screenDisplay = this.currentFloor;
                }
            }
            this.status = 'stopped';
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
        //wait 5 sec
        if (!this.isOverweight()) {
            this.door.status = 'closing';
            if(!this.door.obstruction()) 
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

    obstruction() {
        return false;
    }
}

//let column = new Column(1, 10, 2)
//console.log(column) 

module.exports = { Column, Elevator, CallButton, FloorRequestButton, Door };