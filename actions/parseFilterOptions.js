const { Op } = require('sequelize');
var pointer;

function parseAnOperation(options) {
    var op;
    var arg1;
    var arg2;
    var opType;

    if(options[pointer] == '(') {
        pointer++;
        arg1 = parseAnOperation(options);
    } else {
        arg1 = options[pointer];
        while(options[pointer + 1] != ' ') {
            pointer++;
            arg1 += options[pointer];
        }
        pointer++;
    }

    pointer++; //jump over empty space

    if(options[pointer] == 'A') {
        op = Op.and;
        pointer+=3;
        opType = 1;
    } else if(options[pointer] == 'O') {
        op = Op.or;
        pointer+=2;
        opType = 1;
    } else if(options[pointer] == 'g') {
        op = Op.gt;
        pointer+=2;
        opType = 2;
    } else if(options[pointer] == 'l') {
        op = Op.lt;
        pointer+=2;
        opType = 2;
    } else if(options[pointer] == 'e') {
        op = Op.eq;
        pointer+=2;
        opType = 2;
    } else if(options[pointer] == 'n') {
        op = Op.ne;
        pointer+=2;
        opType = 2;
    }

    pointer++; //jump over empty space

    if(options[pointer] == '(') {
        pointer++;
        arg2 = parseAnOperation(options);
    } else {
        arg2 = options[pointer];
        while(pointer + 1 < options.length && options[pointer + 1] != ')') {
            pointer++;
            arg2 += options[pointer];
        }
        pointer++;
    }

    pointer++;

    var result = {};
    if(opType == 1) {
        result[op] = [arg1, arg2];
    } else {
        result[arg1] = {};
        result[arg1][op] = arg2;
    }
    return result;
}

function parseFilterOptions(options) {
    pointer = 0;
    if(options == undefined || options == '')
        return {};
    return parseAnOperation(options);
}

module.exports = parseFilterOptions;
