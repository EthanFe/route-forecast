import React from 'react';
import {Button} from '@blueprintjs/core';

import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import ReactDOM from 'react-dom';

class ControlTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {rowCount:0,rowsToRemove:[]};
        this.addToRemoveList = this.addToRemoveList.bind(this);
        this.addRow = this.addRow.bind(this);
        this.removeRow = this.removeRow.bind(this);
        this.onGridReady = this.onGridReady.bind(this);
        this.deleteRenderer = this.deleteRenderer.bind(this);
        this.cellUpdated = this.cellUpdated.bind(this);
        this.sortChanged = this.sortChanged.bind(this);
        this.updateFromGrid = this.updateFromGrid.bind(this);
    }

    onGridReady(params) {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }

    addToRemoveList(row) {
        this.removeRow(this.api.getRowNode(row));
    }

    addRow() {
        if (this.api===undefined) {
            return;
        }
        let row = {name:'',id:this.props.controls.length};
        let result = this.api.updateRowData({add:[row], addIndex:row.id});
        // focus on new control if one has been added
        this.api.setFocusedCell(this.props.controls.length,'name',null);
    }

    removeRow(row) {
        let transaction = {remove:[row]};
        this.api.updateRowData(transaction);
        this.updateFromGrid();
    }

    static appendUnit(cell) {
        return cell.value + ' min';
    }

    static validateData(params) {
        if (Number.isNaN(parseInt(params.newValue,10)) && params.oldValue!==params.newValue) {
            return false;
        }
        else {
            params.data[params.colDef.field] = params.newValue;
            return true;
        }
    }

    // create a DOM object
    deleteRenderer(params) {
        const deleteButton = <Button onClick={event=>this.addToRemoveList(params.node.id)} iconName={'delete'}></Button>;
        let eDiv = document.createElement('div');
        ReactDOM.render(deleteButton, eDiv);
        return eDiv;
    }

    static tabHandler(params) {
        let nextCell = params.nextCellDef;
        if (params.backwards) {
            return nextCell;
        } else {
            if (nextCell.column.colId==='arrival') {
                let col = nextCell.column.columnApi.getColumn('name');
                let renderedRowCount = nextCell.column.gridApi.getModel().getRowCount();
                let nextRowIndex = nextCell.rowIndex + 1;
                if (nextRowIndex >= renderedRowCount) {
                    nextRowIndex = 0;
                }
                return {rowIndex:nextRowIndex, column:col};
            } else {
                return params.nextCellDef;
            }
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.api===undefined || newProps===undefined) {
            return;
        }
        this.columnApi.setColumnVisible('banked',newProps.displayBanked);
        this.columnApi.setColumnVisible('actual',newProps.compare);
        if (newProps.controls.every(ctl => ctl.id===undefined)) {
            newProps.controls.forEach((row,key) => row.id=key);
        }
        this.api.setRowData(newProps.controls);
        this.setState({rowCount:this.api.getModel().getRowCount()});
        this.updateFromGrid();
    }

    static doControlsMatch(newControl, oldControl) {
        return newControl.distance===oldControl.distance &&
            newControl.name===oldControl.name &&
            newControl.duration===oldControl.duration &&
            newControl.arrival===oldControl.arrival &&
            newControl.actual===oldControl.actual &&
            newControl.banked===oldControl.banked;
    }

    shouldComponentUpdate(nextProps,nextState) {
        // compare controls
        let controls = this.props.controls;
        return !(nextProps.controls.length===this.props.controls.length &&
            nextProps.controls.every((v,i)=> ControlTable.doControlsMatch(v,controls[i])));
    }

    setData(params) {
        return Number(params.newValue);
    }

    cellUpdated(params) {
        if (params.colDef.field==="name") {
            if (params.newValue===params.oldValue) {
                return;
            }
        } else {
            if (params.newValue===Number(params.oldValue)) {
                return;
            }
        }
        let rowData = params.node.data;
        if (ControlTable.isValidRow(rowData)) {
            // update
            this.setState({rowCount:this.api.getModel().getRowCount()});
            this.updateFromGrid();
        }
    }

    static isValidRow(rowData) {
        return (rowData.name!==undefined && rowData.distance!==undefined && rowData.duration!==undefined &&
            rowData.name!=="" && rowData.distance!=="" && rowData.distance !== 0 && rowData.duration!=="" && rowData.duration!==0);
    }

    sortChanged(params) {
        this.setState({rowCount:this.api.getModel().getRowCount()});
        this.updateFromGrid();
    }

    updateFromGrid() {
        let modifiedControls = [];
        this.api.forEachNodeAfterFilterAndSort(node => modifiedControls.push(node.data));
        // modifiedControls.forEach((row,key) => row.id=key);
        this.props.update(modifiedControls);
    }

    render() {
        this.props.controls.forEach((row,key) => row.id=key);
        let displayBanked = this.props.displayBanked;
        return (<div className="ag-theme-fresh">
            <AgGridReact enableColResize enableSorting animateRows sortingOrder={['asc']} unSortIcon rowData={this.props.controls}
                         onGridReady={this.onGridReady} onSortChanged={this.sortChanged}
                         onCellValueChanged={this.cellUpdated} tabToNextCell={ControlTable.tabHandler} getRowNodeId={data => data.id}>
                <AgGridColumn colId='name' field='name' unSortIcon={true} suppressSorting editable={true} headerName='Name'></AgGridColumn>
                <AgGridColumn field='distance' headerTooltip='In miles or km, depending on the metric checkbox'
                              type={'numericColumn'} unSortIcon={true} editable={true} valueParser={this.setData} valueSetter={ControlTable.validateData} headerName='Distance'></AgGridColumn>
                <AgGridColumn field='duration' headerTooltip='How many minutes you expect to spend at this control'
                              suppressSorting type={'numericColumn'} editable={true} valueParser={params=>{return Number(params.newValue)}}
                              valueSetter={ControlTable.validateData} valueFormatter={ControlTable.appendUnit} headerName='Expected time spent'></AgGridColumn>
                <AgGridColumn field='arrival' headerTooltip='When you are predicted to arrive here'
                              cellRenderer="agAnimateShowChangeCellRenderer" type={'numericColumn'}
                              suppressNavigable suppressSorting enableCellChangeFlash={true} headerName='Est. arrival time'></AgGridColumn>
                <AgGridColumn colId='actual' field='actual' suppressSorting enableCellChangeFlash={true} cellRenderer="agAnimateShowChangeCellRenderer"
                              headerTooltip='When you actually arrived here' suppressNavigable hide={!this.props.compare} headerName='Actual arrival time'></AgGridColumn>
                <AgGridColumn colId='banked' field='banked' headerTooltip='Time remaining at brevet pace'
                              cellRenderer="agAnimateShowChangeCellRenderer"
                              suppressNavigable suppressSorting type={'numericColumn'} valueFormatter={ControlTable.appendUnit} hide={!displayBanked} headerName='Banked time'></AgGridColumn>
                <AgGridColumn suppressNavigable suppressSorting cellRenderer={this.deleteRenderer}></AgGridColumn>
            </AgGridReact>
        </div>);
    }
}

export default ControlTable;