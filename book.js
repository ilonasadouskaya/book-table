'use strict';

class Events {
  constructor() {
    this.addEventListenerForNavigation();
  }

  createEventListener(element, event, callFunction) {
    element.addEventListener(event, callFunction);
  }

  terraceCallFunction() {
    const room = document.getElementById('book__section_room');
    room.className = 'terrace';
    room.style.backgroundColor = 'rgba(204, 255, 204, 0.5)';
  }

  smokingCallFunction() {
    const room = document.getElementById('book__section_room');
    room.className = 'smoking';
    room.style.backgroundColor = 'rgba(255, 255, 204, 0.5)';
  }

  nonSmokingCallFunction() {
    const room = document.getElementById('book__section_room');
    room.className = 'nonSmoking';
    room.style.backgroundColor = 'rgba(204, 255, 255, 0.5)';
  }

  addEventListenerForNavigation() {
    const terrace = document.getElementById('nav__room_terrace');
    const smoking = document.getElementById('nav__room_smoking');
    const nonSmoking = document.getElementById('nav__room_non-smoking');
    this.createEventListener(terrace, 'click', this.terraceCallFunction);
    this.createEventListener(smoking, 'click', this.smokingCallFunction);
    this.createEventListener(nonSmoking, 'click', this.nonSmokingCallFunction);
  }
}


class Furniture {
  cellContainer = document.getElementById('room');
  cells = document.getElementsByClassName('cell');
  deleteFurnitureContainer = document.getElementById('delete_furniture_container');
  addFurnitureButtonsContainer = document.getElementById('add_furniture_buttons_container');
  newFurnitureItemContainer = document.getElementById('new_furniture_item_container');
  // переименовать
  currentDroppable = null;

  constructor() {
    this.addEventListenersForAddFurniture();
  }

  getAdjacentCells(cellNumber) {
    const adjacentCells = [cellNumber + 10, cellNumber - 1, cellNumber - 10, cellNumber + 1];
    adjacentCells.forEach((cell, index) => {
      if(cell < 0 || cell > 48) {
        delete adjacentCells[index];
      };
    });
    return adjacentCells;
  }

  moveAt(event) {
    const targetItem = event.target;
    targetItem.style.left = event.pageX - targetItem.offsetWidth / 2 + 'px';
    targetItem.style.top = event.pageY - targetItem.offsetHeight / 2 + 'px';
  }

  onMouseMove(event) {
    const targetItem = event.target;

    function moveAt(event) {
      const targetItem = event.target;
      targetItem.style.left = event.pageX - targetItem.offsetWidth / 2 + 'px';
      targetItem.style.top = event.pageY - targetItem.offsetHeight / 2 + 'px';
    }
    moveAt(event);

    targetItem.hidden = true;
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    targetItem.hidden = false;

    if (!elemBelow) {
      return;
    }

    let droppableBelow = elemBelow.closest('.cell');

    if (this.currentDroppable != droppableBelow) {
      if (this.currentDroppable) {
        this.currentDroppable.classList.remove('active_cell')
      }
      this.currentDroppable = droppableBelow;
      if (this.currentDroppable) {
        this.currentDroppable.classList.add('active_cell');
      }
    }
  }

  eventForDragStart(event) {
    const targetItem = event.target;
    targetItem.parentElement.parentElement.classList.add('furniture_selected');

    targetItem.ondragstart = function() {
      return false;
    };

    document.body.append(targetItem);
    this.moveAt(event);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  deleteChildren(element) {
    while(element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  eventForDragEnd(targetItem) {
    document.removeEventListener('mousemove', this.onMouseMove);
    let movedItem = document.getElementsByClassName('furniture_selected')[0];
    let dropTarget = document.getElementsByClassName('active_cell')[0];

    const clearRoomStyles = () => {
      document.body.removeChild(targetItem);
      for (const cell of this.cells) {
        cell.className = 'cell';
      };
    }

    if (dropTarget === this.deleteFurnitureContainer) {
      this.deleteChildren(movedItem);
      clearRoomStyles();
      return;
    }

    if(dropTarget === this.addFurnitureButtonsContainer || dropTarget === this.newFurnitureItemContainer) {
      dropTarget = movedItem;
    }

    if(dropTarget === movedItem || dropTarget === undefined) {
      this.deleteChildren(movedItem);
      clearRoomStyles();
      return movedItem;
    }

    if(movedItem) {
      this.deleteChildren(movedItem);
    }
    if(dropTarget) {
      this.deleteChildren(dropTarget);
    }

    clearRoomStyles();
    return dropTarget;
  }

  addEventListenersForFurniture(item) {
    item.addEventListener('mousedown', (event) => this.eventForDragStart(event));
    item.addEventListener('mouseup', (event) => this.eventForDragEnd(event.target));
  }

  checkAndAddAdditionalTable(event) {
    while(this.newFurnitureItemContainer.children.length > 1) {
      this.newFurnitureItemContainer.removeChild(this.newFurnitureItemContainer.firstChild)
    }
    const allTables = document.getElementsByClassName('table');
    return allTables.length;
  }

  checkAndAddAdditionalChair(event) {
    while(this.newFurnitureItemContainer.children.length > 0) {
      this.newFurnitureItemContainer.removeChild(this.newFurnitureItemContainer.firstChild)
    }
    const allChairs = document.getElementsByClassName('chair');
    return allChairs.length;
  }

  addEventListenersForAddFurniture() {
    const addChairButton = document.getElementById('add_chair_button');
    const addTableButton = document.getElementById('add_table_button');
    addChairButton.addEventListener('click', (event) => this.checkAndAddAdditionalChair(event));
    addTableButton.addEventListener('click', (event) => this.checkAndAddAdditionalTable(event));
  }
}


class Table extends Furniture {
  constructor() {
    super();
    this.setDefaultTables();
  }

  eventForDragStart(eventItem) {
    super.eventForDragStart(eventItem);
    this.cellContainer.classList.add('room_show_border');
    for (const cell of this.cells) {
      cell.classList.add('room_show_border');
    };
  }

  eventForDragEnd(eventItem) {
    const dropTarget = super.eventForDragEnd(eventItem);
    this.cellContainer.classList.remove('room_show_border');
    for (const cell of this.cells) {
      cell.classList.remove('room_show_border');
    };
    if(!dropTarget) {
      return;
    }
    const dropTargetId = Number(dropTarget.id.match(/\d+/g));
    this.addTable(dropTargetId);
  }

  checkAndAddAdditionalTable(event) {
    const allTablesAmount = super.checkAndAddAdditionalTable(event);
    if(allTablesAmount + 1 > 5) {
      alert('Maximum 5 tables can be in the room!');
      return;
    }
    this.addTable(this.newFurnitureItemContainer.id);
  }

  addTable(cell) {
    let tableCell = document.getElementById(`cell-${cell}`);
    if(!tableCell) {
      tableCell = document.getElementById(`${cell}`);
    }
    if(tableCell.children.length) {
      const tableCellChild = tableCell.firstElementChild;
      if(tableCellChild.className !== 'table') {
        tableCell.removeChild(tableCellChild);
      }
    }
    const table = document.createElement('div');
    table.className = 'table';
    const img = document.createElement('img');
    img.src = 'assets/table.png';
    img.alt = 'table_image';
    img.className = 'table__img';
    this.addEventListenersForFurniture(img);
    table.appendChild(img);
    tableCell.append(table);
  }

  setDefaultTables() {
    const cellNumbers = [13, 17, 18, 45];
    cellNumbers.forEach(cell => this.addTable(cell));
  }
}


class Chair extends Furniture {
  constructor() {
    super();
    this.setDefaultChairs();
  }

  eventForDragEnd(eventItem) {
    const dropTarget = super.eventForDragEnd(eventItem);
    if(!dropTarget) {
      return;
    }
    const dropTargetId = Number(dropTarget.id.match(/\d+/g));
    this.addChair(dropTargetId);
  }

  checkAndAddAdditionalChair(event) {
    const allChairsAmount = super.checkAndAddAdditionalChair(event);
    if(allChairsAmount + 1 > 20) {
      alert('Maximum 20 chairs can be in the room!');
      return;
    }
    this.addChair(this.newFurnitureItemContainer.id);
  }

  adjustChairToTable(cell, chair) {
    const rotationDegree = [0, 90, 180, 270];

    const adjacentCells = this.getAdjacentCells(cell);
    adjacentCells.some((adjacentCell, index) => {
      const chairAdjacentCell = document.getElementById(`cell-${adjacentCell}`);
      if(!chairAdjacentCell || !chairAdjacentCell.children.length) {
        return false;
      }
      if(chairAdjacentCell.firstChild.className !== 'table') {
        return false;
      }
      const elementRotationDegree = rotationDegree[index];
      chair.style.transform = `rotate(${elementRotationDegree}deg)`;
      return true;
    });
  }

  addChair(cell) {
    let chairCell = document.getElementById(`cell-${cell}`);
    if(!chairCell) {
      chairCell = document.getElementById(`${cell}`);
    }
    const chair = document.createElement('div');
    chair.className = 'chair';
    const img = document.createElement('img');
    img.src = 'assets/chair.png';
    img.alt = 'chair_image';
    img.className = 'chair__img';
    this.addEventListenersForFurniture(img);
    chair.appendChild(img);
    chairCell.appendChild(chair);
    this.adjustChairToTable(cell, chair);
  }

  setDefaultChairs() {
    const cellNumbers = [3, 7, 8, 12, 14, 16, 19, 23, 27, 28, 35, 44, 46];
    cellNumbers.forEach(cell => this.addChair(cell));
  }
}


const events = new Events();

const furniture = new Furniture();
const tables = new Table();
const chairs = new Chair();
