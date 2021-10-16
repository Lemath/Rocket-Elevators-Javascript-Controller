class Column 
{
    constructor(_id, _amountOfFloors, _amountOfElevators, _status='online', _bottomFloor=1) 
    {
        this.ID = _id;
        this.status = _status;
        this.amountOfFloors = _amountOfFloors;
        this.amountOfElevators = _amountOfElevators;
        this.bottomFloor = _bottomFloor;
        this.topFloor = this.bottomFloor + this.amountOfFloors - 1;
        this.elevatorList = [];
        this.callButtonList = [];
        this.buildElevatorList();
        this.buildCallButtonList();
    }  

    buildCallButtonList() 
    { 
        let id = 1;
        for (let floor = this.bottomFloor; floor < this.topFloor ; floor++) {
            this.callButtonList.push(new CallButton(id, floor, 'up'));
            id++;
        }
        for (let floor = this.bottomFloor +1; floor <= this.topFloor; floor++) {
            this.callButtonList.push(new CallButton(id, floor, 'up'));
            id++;
        }
    }

    buildElevatorList() 
    {
        for (let id = 1; id <= this.amountOfElevators; id++) {
            this.elevatorList.push(new Elevator(id, this.amountOfFloors));
        }
    }

    requestElevator(requestedFloor, direction) 
    {
        let bestElevator = this.findElevator(requestedFloor, direction);
        bestElevator.floorRequestList.push(requestedFloor);
        bestElevator.move();
        bestElevator.operateDoors();
        return bestElevator;
    }

    findElevator(requestedFloor, requestedDirection) 
    {
        let comparedElevator = {
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
            let bestElevator = elevator.compareElevator(score, comparedElevator, requestedFloor);
            comparedElevator = bestElevator;
        });
        return comparedElevator.elevator;
    }
}

class Elevator 
{
    constructor(_id, _amountOfFloors, _status='idle', _currentFloor=1) 
    {
        this.ID = _id;
        this.status = _status;
        this.amountOfFloors = _amountOfFloors;
        this.currentFloor = _currentFloor;
        this.direction = null;
        this.screenDisplay = this.currentFloor;
        this.door = new Door(this.ID, 'closed');
        this.overweightAlarm = false
        this.overweightSensor = 'OFF';
        this.floorRequestButtonList = [];
        this.floorRequestList = [];
        this.createFloorRequestButtons();
    }

    createFloorRequestButtons() 
    {
        for (let idAndFloor = 1; idAndFloor <= this.amountOfFloors; idAndFloor++) {
            this.floorRequestButtonList.push(new FloorRequestButton(idAndFloor, idAndFloor));
        }
    }

    compareElevator(scoreToCheck, comparedElevator, floor) 
    {
        let bestElevator = comparedElevator;
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
        return bestElevator;
    }

    requestFloor(requestedFloor) 
    {
        this.floorRequestList.push(requestedFloor);
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
        let elevator = this;
        //setTimeout(function() {
            if (!elevator.isOverweight()) {
                elevator.door.status = 'closing';
                if(!elevator.door.isObstructed()) 
                {                    
                    elevator.door.status = 'closed';
                } else {
                    elevator.operateDoors();
                }
            } else {
                while (elevator.isOverweight()) {
                    elevator.overweightAlarm = true;
                }
                elevator.overweightAlarm = false;
                elevator.operateDoors();
            }    
        //}, 5000);
        
    }

    isOverweight() 
    {
        return this.overweightSensor == 'ON';
    }
}

class CallButton 
{
    constructor(_id, _floor, _direction, _status='OFF') 
    {
        this.ID = _id;
        this.floor = _floor;
        this.direction = _direction;
        this.status = _status;
    }
}

class FloorRequestButton 
{
    constructor(_id, _floor, _status='OFF') 
    {
        this.ID = _id;
        this.floor = _floor;
        this.status = _status;
    }
}

class Door 
{
    constructor(_id, _status='closed') 
    {
        this.ID = _id;
        this.status = _status;
        this.sensorState = 'OFF';
    }

    isObstructed() 
    {
        return this.sensorState == 'ON';
    }
}


module.exports = { Column, Elevator, CallButton, FloorRequestButton, Door };