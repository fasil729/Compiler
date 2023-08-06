"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
export const __esModule = true;
/** Provides functions for translating tokens to mips */
var Translate = /** @class */ (function () {
    function Translate() {
        var _this = this;
        this.functions = [];
        /** array of user defined functions to be returned at the end */
        this.userDefinedFunctions = [];
        /** Current if statement */
        this.ifCounter = -1;
        /** Stack to keep track of if statements being used, especially when nested */
        this.ifStack = [];
        /** Current loop statement */
        this.loopCounter = -1;
        /** Stack to keep track of loop statements being used, especially when nested */
        this.loopStack = [];
        this.translate = function (pyCode) {
            var mipsCode = "";
            switch (pyCode.token) {
                case "print":
                    mipsCode += _this.translatePrint(pyCode);
                    break;
                case "input":
                    mipsCode += _this.translateInput(pyCode);
                    break;
                case "variableAssignment":
                    mipsCode += _this.translateVariableAssignment(pyCode);
                    break;
                case "artihmeticExpression":
                    mipsCode += _this.translateArithmetic(pyCode);
                    break;
                case "ifStatement":
                    mipsCode += _this.translateIfStatement(pyCode);
                    break;
                case "loop":
                    mipsCode += _this.translateLoop(pyCode);
                    break;
                case "loopBreak":
                    mipsCode += _this.translateLoopBreak(pyCode);
                    break;
                case "array":
                    mipsCode += "#translate ARRAY";
                    break;
                case "arrayOperation":
                    mipsCode += _this.translateArrayOperation(pyCode);
                    break;
                case "function":
                    mipsCode += _this.translateFunctionCall(pyCode);
                    break;
                case "return":
                    mipsCode += _this.translateReturn(pyCode);
                    break;
                case "functionDeclaration":
                    _this.userDefinedFunctions.push(_this.translateFunctionDeclaration(pyCode));
                    break;
                default:
                    //mipsCode += `#some error occured got token: ${pyCode.token}`;;
                    break;
            }
            return { mipsCode: mipsCode, functions: { userDefined: _this.userDefinedFunctions, inBuilt: _this.functions } };
        };
    }
    Translate.prototype.translateArrayOperation = function (token) {
        var arrayOperationMips = "";
        switch (token.type) {
            case "elementAssignment":
                arrayOperationMips += this._translateElementAssignment(token.properties);
                break;
            default:
                break;
        }
        return arrayOperationMips;
    };
    Translate.prototype._translateElementAssignment = function (assignment) {
        var elementAssignmentMips = "";
        //get element index of the assignment
        elementAssignmentMips += this._getElementIndex(assignment.index);
        //get address of array at index
        elementAssignmentMips += "".concat(assignment.arrayRef.allocation === "static" ? "la" : "lw", " $t2, ").concat(assignment.arrayRef.value, "\naddi $t3, $0, 4\nmult $t3, $t0\nmflo $t4\nadd $t4, $t4, $t3 # t4 = i * 4 + 4\nadd $t4, $t4, $t2 # $t4 points to next location in the list\n");
        //update value at address
        elementAssignmentMips += this._translateAssignment(assignment.value, "($t4)");
        return elementAssignmentMips;
    };
    /** Translates assignments. Stores in register */
    Translate.prototype._translateAssignment = function (assignmentType, register, initialDeclaration, space) {
        if (register === void 0) { register = "$t0"; }
        if (initialDeclaration === void 0) { initialDeclaration = false; }
        var assignmentMips = "";
        if (assignmentType.value !== undefined && !initialDeclaration) {
            var dataObj = assignmentType;
            switch (dataObj.type) {
                case "string":
                    //this variable is being reused later, hence need to load each character one by one into the buffer
                    // variableAssignmentMips += `#WARNING DUE TO REASSINGING THIS STRING TYPE VARIABLE SOMEWHERE IN YOUR CODE, MIPS HAS TO LOAD EACH CHARACTER OF THE STRING INTO THE LABEL ADDRESS.
                    // THIS RESULTS IN EXTREMELY LONG MIPS CODE.`
                    assignmentMips += "la $s0, ".concat(register, "\n") + this._storeStringInMips(dataObj.value, register);
                    break;
                case "int":
                    assignmentMips += "li $t0, ".concat(dataObj.value, "\n").concat(register === "$t0" ? "" : "sw $t0, ".concat(register, "\n"));
                    break;
                case "boolean":
                    assignmentMips += "li $t0, ".concat(dataObj.value ? "1" : "0", "\n").concat(register === "$t0" ? "" : "sw $t0, ".concat(register, "\n"));
                    break;
                case "variable-int":
                    assignmentMips += "lw $t0, ".concat(dataObj.value, "\n").concat(register === "$t0" ? "" : "sw $t0, ".concat(register, "\n"));
                    break;
                case "variable-boolean":
                    assignmentMips += "lw $t0, ".concat(dataObj.value, "\n").concat(register === "$t0" ? "" : "sw $t0, ".concat(register, "\n"));
                    break;
                case "variable-artihmeticExpression":
                    assignmentMips += "lw $t0, ".concat(dataObj.value, "\n").concat(register === "$t0" ? "" : "sw $t0, ".concat(register, "\n"));
                    break;
                case "variable-string":
                    assignmentMips += "la $s0, ".concat(register, "\nadd $a0, $s0, $0\nla $a1, ").concat(dataObj.value, "\njal strConcat\n");
                    break;
                case "variable-parameter":
                    assignmentMips += "lw $t0, ".concat(dataObj.value, "\n").concat(register === "$t0" ? "" : "sw $t0, ".concat(register, "\n"));
                    break;
                case "arrayElement":
                    var arrayElem = assignmentType;
                    assignmentMips += "li $t0, 4\n".concat(arrayElem.value.arrayRef.allocation === "static" ? "la" : "lw", " $t1, ").concat(arrayElem.value.arrayRef.value, "\nadd $t1, $t1, $t0\n"); //get starting address of list
                    assignmentMips += this._getElementIndex(arrayElem.value.index, "$t2"); //get index
                    assignmentMips += "mult $t2, $t0\nmflo $t2\nadd $t2, $t2, $t1\n"; //address of element
                    assignmentMips += "lw $t0, ($t2)\n".concat(register === "$t0" ? "" : "sw $t0, ".concat(register, "\n")); //load elem
                    break;
                default:
                    break;
            }
        }
        // else if ((assignmentType as StringConcatenationToken).token === "stringConcatenation") {
        //     // Token is a string concatenation i.e. s = "hello" + "world"
        //     const stringConcatenationToken = assignmentType as StringConcatenationToken;
        //     const variable = register
        //     const addedStrings = (stringConcatenationToken.properties as StringConcatProperties).addedStrings
        //     //check if adding variable to itself i.e. x = x + "some stuff"
        //     assignmentMips += addedStrings[0].type === "variable" && (addedStrings[0].value === variable)
        //         ? `la $s0, ${variable}\naddi $s0, $s0, ${Token.properties.space - 1}\n`
        //         : `la $s0, ${variable}\n`;
        //     assignmentMips += this.translateStringConcatenation(stringConcatenationToken, variable);
        // }
        else if (assignmentType.token === "function") {
            var functionToken = assignmentType;
            assignmentMips += this.translateFunctionCall(functionToken);
            assignmentMips += "sw $v0, ".concat(register, "\n");
        }
        else if (assignmentType.token === "array") {
            var arrayToken = assignmentType;
            assignmentMips += this.allocateArray(arrayToken, register);
        }
        else if (assignmentType.token === "input") {
            // Token is an input()
            console.log("INPUT", assignmentType);
            console.log("VARIABLE", register);
            var inputToken = assignmentType;
            assignmentMips += this.translateInput(inputToken, register);
        }
        else if (assignmentType.token === "artihmeticExpression") {
            // Token is an arithmetic expression
            //console.log("TRAVERSING ARITHMETIC", this._postOrderArithmetic(assignmentType as ArtihmeticExpressionToken));
            var arithemeticExpression = assignmentType;
            assignmentMips += this.translateArithmetic(arithemeticExpression);
            if (register !== "$t0")
                assignmentMips += "sw $t0, ".concat(register, "\n");
        }
        return assignmentMips;
    };
    /** Translates the value of a given index and stores it in the given register */
    Translate.prototype._getElementIndex = function (index, register) {
        if (register === void 0) { register = "$t0"; }
        var elementIndex = '';
        if (index.type === "int") {
            elementIndex += "li ".concat(register, ", ").concat(index.value, "\n");
        }
        else if (index.type.includes("variable")) {
            elementIndex += "lw ".concat(register, ", ").concat(index.value, "\n");
        }
        else {
            //Arithmetic index
            elementIndex += this.translateArithmetic(index);
            elementIndex += register === "$t0" ? "" : "add ".concat(register, ", $t0, $0\n");
        }
        return elementIndex;
    };
    /** mips array allocation
     * @param register the register to store the array reference
    */
    Translate.prototype.allocateArray = function (token, register) {
        var mipsArray = "";
        if (token.properties.allocation === "dynamic") {
            mipsArray += "lw $t0, ".concat(token.properties.length.value, "\naddi $t1, $0, 4\nmult $t1, $t0\nmflo $t2\nadd $a0, $t2, $t1 # $a0 = 4*size + 4\naddi $v0, $0, 9 # $v0 = 9\nsyscall # allocate memory\nsw $v0, ").concat(register, " # the_list now points to the returned address\nsw $t0, ($v0) # store length of list\n");
        }
        return mipsArray;
    };
    /** Translates function declarations to Mips code */
    Translate.prototype.translateFunctionDeclaration = function (definition) {
        var _this = this;
        var mipsDeclaration = "";
        // Set label
        mipsDeclaration += "".concat(definition.properties.identifier, ":\n");
        // Save $ra and $fp
        mipsDeclaration += "addi $sp, $sp, -8\nsw $ra, 4($sp)\nsw $fp, 0($sp)\n";
        // Copy $sp to $fp
        mipsDeclaration += "addi $fp, $sp, 0\n";
        // Allocate local variables
        mipsDeclaration += "addi $sp, $sp, ".concat(definition.properties.localVariableCount * -4, "\n");
        // Translate body
        definition.properties.body.forEach(function (elem) {
            if (elem.token) {
                //elem is a token
                console.log("function declaration translating", elem);
                mipsDeclaration += _this.translate(elem).mipsCode;
            }
        });
        // Return result
        if (definition.properties.returns.length === 0) {
            // Load 'None' into $v0, this is the default value that will be return if no other value is to be returned
            mipsDeclaration += "li $v0, -255\t#Loading 'None' into $v0 as a fallback default value to be returned [DevNote: change -255 to string 'None' soon]\n";
            // Remove local variables
            mipsDeclaration += "addi $sp, $sp, ".concat(definition.properties.localVariableCount * 4, "\n");
            // Restore $fp and $ra
            mipsDeclaration += "lw $fp, 0($sp)\nlw $ra, 4($sp)\naddi $sp, $sp, 8\n";
            // Return to caller
            mipsDeclaration += "jr $ra\n";
        }
        return mipsDeclaration;
    };
    Translate.prototype.translateReturn = function (returned) {
        var mipsReturn = "";
        // Load return value in $v0
        mipsReturn += this._loadValueIntoRegister(returned.properties.value, "$v0", false);
        mipsReturn += "addi $sp, $sp, ".concat(returned.properties.localVariableCount * 4, "\n");
        // Restore $fp and $ra
        mipsReturn += "lw $fp, 0($sp)\nlw $ra, 4($sp)\naddi $sp, $sp, 8\n";
        // Return to caller
        mipsReturn += "jr $ra\n";
        return mipsReturn;
    };
    /** Translate function calls to Mips code by loading each parameter into a register $a[i] and then calling the function.
     *  Automatically diffrentiates between in-built and user-defined functions.
     * @returns result of function called stored in $v0
    */
    Translate.prototype.translateFunctionCall = function (func) {
        var mipsFunction = "";
        var functionProps = func.properties;
        if (functionProps.userDefined) {
            mipsFunction += this._translateUserDefinedFunctionCall(functionProps);
        }
        else {
            //load each parameter into $a[i]
            mipsFunction += functionProps.parameters ? this.translateFunctionParameters(functionProps.parameters) : "";
            //call function
            mipsFunction += "jal ".concat(functionProps.identifier, "\n");
            this.functions.push(functionProps.identifier);
        }
        return mipsFunction;
    };
    Translate.prototype._translateUserDefinedFunctionCall = function (functionProps) {
        var mipsFunction = "";
        //save temporary registers
        //???
        //make copy of sp
        mipsFunction += "addi $fp, $sp, 0\n";
        //push arguments to stack
        mipsFunction += functionProps.parameters ? "addi $sp, $sp, ".concat(functionProps.parameters.length * -4, "\n") : "";
        mipsFunction += functionProps.parameters ? this.translateFunctionParameters(functionProps.parameters, true) : "";
        //call function
        mipsFunction += "jal ".concat(functionProps.identifier, "\n");
        //remove arguments from stack
        mipsFunction += functionProps.parameters ? "addi $sp, $sp, ".concat(functionProps.parameters.length * 4, "\n") : "";
        return mipsFunction;
    };
    Translate.prototype.translateFunctionParameters = function (parameters, userDefined) {
        var _this = this;
        if (userDefined === void 0) { userDefined = false; }
        var mipsParameters = parameters.map(function (param, index) {
            switch (param.type) {
                case "artihmeticExpression":
                    return userDefined ? _this.translateArithmetic(param) + "sw $t0, ".concat(index * 4, "($sp)\n") : _this.translateArithmetic(param) + "add $a".concat(index, ", $t0\n");
                case "int":
                    return userDefined ? "li $t0, ".concat(param.value, "\nsw $t0, ").concat(index * 4, "($sp)\n") : "li $a".concat(index, ", ").concat(param.value, "\n");
                case "string":
                    return userDefined ? "la $t0, ".concat(param.value, "\nsw $t0, ").concat(index * 4, "($sp)\n") : "la $a".concat(index, ", ").concat(param.value, "\n");
                case "variable-array":
                    return userDefined ? "".concat(param.allocation === "static" ? "la" : "lw", " $t0, ").concat(param.value, "\nsw $t0, ").concat(index * 4, "($sp)\n") : "".concat(param.allocation === "static" ? "la" : "lw", " $a").concat(index, ", ").concat(param.value, "\n");
                case "variable-int":
                    return userDefined ? "lw $t0, ".concat(param.value, "\nsw $t0, ").concat(index * 4, "($sp)\n") : "lw $a".concat(index, ", ").concat(param.value, "\n");
                case "variable-string":
                    return userDefined ? "la $t0, ".concat(param.value, "\nsw $t0, ").concat(index * 4, "($sp)\n") : "la $a".concat(index, ", ").concat(param.value, "\n");
                default:
                    break;
            }
        });
        return mipsParameters.join("");
    };
    /** Translates print tokens to mips code */
    Translate.prototype.translatePrint = function (token) {
        var _this = this;
        var printMips = "";
        token.properties.prompt.forEach(function (prompt) {
            printMips += _this._translatePrintPrompt(prompt);
        });
        //print newline after a print statement
        // printMips += "#printing newline\naddi $a0, $0, 10 #ascii code for LF(newline), if you have any trouble try 0xD for CR.\naddi $v0, $0, 11 #syscall 11 prints the lower 8 bits of $a0 as an ascii character.\nsyscall\n";
        return printMips;
    };
    /** Translates all prompts(in a single print statement) into mips */
    Translate.prototype._translatePrintPrompt = function (printToken) {
        var mipsCode = "";
        if (printToken.spaced) {
            mipsCode += "la $a0, 32\naddi $v0, $0, 11\nsyscall\n"; //printing space
        }
        var arrayElem = printToken;
        switch (printToken.type) {
            case "string":
                mipsCode += "la $a0, ".concat(printToken.value, "\naddi $v0, $0, 4\nsyscall\n");
                break;
            case "int":
                mipsCode += "addi $a0 $0 ".concat(printToken.value, "\naddi $v0, $0, 1\nsyscall\n"); //printing single integer
                break;
            case "variable":
                mipsCode += "lw $a0, ".concat(printToken.value, "\naddi $v0, $0, 1\nsyscall\n"); //printing single integer
                break;
            case "variable-int":
                mipsCode += "lw $a0, ".concat(printToken.value, "\naddi $v0, $0, 1\nsyscall\n"); //printing single integer variable
                break;
            case "variable-artihmeticExpression":
                mipsCode += "lw $a0, ".concat(printToken.value, "\naddi $v0, $0, 1\nsyscall\n"); //printing single integer variable
                break;
            case "variable-string":
                mipsCode += "la $a0, ".concat(printToken.value, "\naddi $v0, $0, 4\nsyscall\n"); //printing single string variable
                break;
            case "variable-array":
                mipsCode += "".concat(printToken.allocation === "static" ? "la" : "lw", " $a0, ").concat(printToken.value, "\njal printArray\n");
                this.functions.push("printArray");
                break;
            case "variable-parameter":
                mipsCode += "lw $a0, ".concat(printToken.value, "\naddi $v0, $0, 1\nsyscall\n"); //all parameters are assumed to be int unless previously assgined
                break;
            case "artihmeticExpression":
                //compute arthimetic expression
                mipsCode += this.translateArithmetic(printToken);
                mipsCode += "add $a0 $0 $t0\naddi $v0, $0, 1\nsyscall\n"; //printing integer
                break;
            case "arrayElement":
                mipsCode += "li $t0, 4\nlw $t1, ".concat(arrayElem.value.arrayRef.value, "\nadd $t1, $t1, $t0\n"); //get starting address of list
                mipsCode += this._getElementIndex(arrayElem.value.index, "$t2"); //translate index to print
                mipsCode += "mult $t2, $t0\nmflo $t2\nadd $t2, $t2, $t1\n"; //address of element to print
                mipsCode += "lw $a0, ($t2)\nli $v0, 1\nsyscall\n"; //print elem
                break;
            case "function":
                var func = printToken;
                //call function
                mipsCode += this.translateFunctionCall(func);
                //print result of function, should be stored in $v0
                mipsCode += "add $a0, $v0, $0\nli $v0, 1\nsyscall\n";
                break;
            default:
                mipsCode += "#some error occured got type: ".concat(printToken.type);
                break;
        }
        //syscallFunc += `la $a0, ${properties.prompt.}\naddi $v0, $0, 4\nsyscall\n`;
        return mipsCode;
    };
    /** Translates input tokens to mips code */
    Translate.prototype.translateInput = function (token, addr) {
        var _this = this;
        var inputMips = "";
        token.properties.prompt.forEach(function (prompt) {
            console.log("INPUT PROMPT", prompt);
            if (prompt.type) {
                inputMips += _this._translatePrintPrompt(prompt);
            }
        });
        inputMips += this._translateInputPrompt(token.type, addr);
        return inputMips;
    };
    Translate.prototype._translateInputPrompt = function (type, addr) {
        var mipsCode = "";
        switch (type) {
            case "int":
                mipsCode += addr ? "addi $v0, $0, 5\nsyscall\nsw $v0, ".concat(addr, "\n")
                    : "addi $v0, $0,5 #[WARNING]:reading an int but not assigning it anywhere\nsyscall\n";
                break;
            case "string":
                mipsCode += addr ? "la $a0, ".concat(addr, "\naddi $a1, $0, 60\naddi $v0, $0, 8\nsyscall\n")
                    : "la $a0, STR_ADDRESS #[WARNING]:reading a string but not assigning it anywhere\nli $a1, MAX_SPACE_FOR_STR\naddi $v0, $0,8\nsyscall\n";
                break;
            case null:
                mipsCode += addr ? "la $a0, ".concat(addr, "\naddi $a1, $0, 60\naddi $v0, $0, 8\nsyscall\n")
                    : "la $a0, STR_ADDRESS #[WARNING]:reading a string but not assigning it anywhere\nli $a1, MAX_SPACE_FOR_STR\naddi $v0, $0,8\nsyscall\n";
                break;
            default:
                return "#some error occured got type: ".concat(type);
        }
        return mipsCode;
    };
    /** Translates variable assignment tokens to mips code */
    Translate.prototype.translateVariableAssignment = function (token) {
        var variableAssignmentMips = "";
        variableAssignmentMips += this._translateAssignment(token.properties.value, token.properties.variable, token.properties.value.initialDeclaration, token.properties.space);
        return variableAssignmentMips;
    };
    Translate.prototype.translateStringConcatenation = function (token, addr) {
        var _this = this;
        var mipsCode = "";
        token.properties.addedStrings.forEach(function (addedString) {
            switch (addedString.type) {
                case "string":
                    mipsCode += "".concat(_this._concatVariableMips(addedString.value));
                    break;
                //update to variable-string and variable-int
                case "variable":
                    mipsCode += token.properties.addedStrings.indexOf(addedString) === 0 && addedString.value === addr
                        ? "" // skip adding the same value
                        : _this._concatVariableMips(addedString.value);
                    break;
                case "variable-string":
                    mipsCode += token.properties.addedStrings.indexOf(addedString) === 0 && addedString.value === addr
                        ? "" // skip adding the same value
                        : _this._concatVariableMips(addedString.value);
                    break;
                case "variable-parameter":
                    mipsCode += token.properties.addedStrings.indexOf(addedString) === 0 && addedString.value === addr
                        ? "" // skip adding the same value
                        : _this._concatVariableMips(addedString.value);
                    break;
                default:
                    return "#some error occured got type: ".concat(addedString.type);
            }
        });
        mipsCode += "li $s0, 0\n"; //resetting saved register.
        return mipsCode;
        //console.log("**********************************************************\n", mipsCode, "\n**********************************************************");
    };
    Translate.prototype._concatVariableMips = function (variable) {
        var mipsCode = "add $a0, $s0, $0\nla $a1, ".concat(variable, "\njal strConcat\n");
        this.functions.push('strConcat');
        return mipsCode;
    };
    Translate.prototype._storeStringInMips = function (string, addr) {
        var storeStringMips = "";
        for (var i = 0; i < string.length; i++) {
            storeStringMips += "li $t0, '".concat(string[i], "'\nsb $t0, 0($s0)\naddi $s0,$s0,1 # advance destination pointer\n");
        }
        storeStringMips += "sb $zero,0($s0) # finished storing ".concat(string, " in label ").concat(addr, "\n");
        return storeStringMips;
    };
    /** Translates loop statements to mips code */
    Translate.prototype.translateLoop = function (token) {
        var _this = this;
        this.loopStack.push(++this.loopCounter);
        var loopMips = "";
        //translate condition
        loopMips += "loop".concat(this.loopCounter, ":\n");
        var exitLoop = "exitLoop".concat(this.loopCounter, "\n");
        loopMips += this.translateBooleanCondition(token.properties.condition, exitLoop);
        if (token.properties.condition.type !== "chainedBoolean") {
            loopMips += "".concat(exitLoop, "\n");
        }
        //translate body
        console.log("loop body:", token.properties.body);
        token.properties.body.forEach(function (elem) {
            if (elem.token) {
                //elem is a token
                console.log("loop translating", elem);
                loopMips += _this.translate(elem).mipsCode;
            }
        });
        var loopCounter = this.loopStack.pop();
        loopMips += "j loop".concat(loopCounter, "\n\n");
        loopMips += "exitLoop".concat(loopCounter, ":");
        return loopMips;
    };
    /** Translates Loop Breaks (continue, break, pass) */
    Translate.prototype.translateLoopBreak = function (token) {
        var loopBreakMips = "";
        switch (token.properties.value) {
            case "break":
                loopBreakMips += "j exitLoop".concat(this.loopCounter, "\n");
                break;
            case "continue":
                loopBreakMips += "j loop".concat(this.loopStack[0], "\n");
                break;
            case "pass":
                //pass does nothing
                break;
            default:
                break;
        }
        return loopBreakMips;
    };
    /** Translates if statements(including corresponding else) to mips code */
    Translate.prototype.translateIfStatement = function (token) {
        this.ifStack.push(++this.ifCounter);
        var mipsCode = "#if".concat(this.ifCounter, "\n");
        console.log("if", token);
        mipsCode += this.translateIfCondition(token.properties.condition, token.properties.alternate ? true : false);
        mipsCode += this.translateIfBody(token.properties.body);
        var ifCounter = this.ifStack.pop();
        if (token.properties.alternate) {
            mipsCode += "j exit".concat(ifCounter, "\n\n");
            mipsCode += "else".concat(ifCounter, ":\n");
            mipsCode += this.translateIfBody(token.properties.alternate);
        }
        mipsCode += "\nexit".concat(ifCounter, ": \n");
        return mipsCode;
    };
    /** Check if two items are of the same type.
     * Note that all arithmeticExpressions == ints and variables of known types are equal to the type of the corresponding literals. i.e.
     * x = 10 and 15 should both be identified as ints
     */
    Translate.prototype._isSameType = function (val1, val2) {
        if (val1.type.includes("function") || val2.type.includes("function")) {
            return true;
        }
        else if (val1.type.includes("string") && val2.type.includes("string")) {
            return true;
        }
        else if ((val1.type.includes("int") || val1.type.includes("artihmeticExpression") || val1.type.includes("boolean") || val1.type.includes("parameter"))
            && (val2.type.includes("int") || val2.type.includes("artihmeticExpression") || val2.type.includes("boolean") || val2.type.includes("parameter"))) {
            return true;
        }
        else {
            return false;
        }
    };
    /** Translates a boolean condition to equivalent mips code
     * @param jumpTo exclusively used by chainedBoolean and is the label to jump to if this condition is True
    */
    Translate.prototype.translateBooleanCondition = function (condition, jumpTo) {
        var booleanMips = "";
        switch (condition.type) {
            case "unaryBoolean":
                booleanMips += this._translateUnaryBoolean(condition, condition.negated);
                break;
            case "binaryBoolean":
                var binaryCondition = condition;
                if (!this._isSameType(binaryCondition.left, binaryCondition.right)) {
                    booleanMips += "#This condition is comparing objects of types ".concat(binaryCondition.left.type, " and ").concat(binaryCondition.right.type, " and will never evaluate to true as comparands are of different types hence, the program just skips it\n\n                    j ");
                }
                else {
                    booleanMips += this._translateBinaryBoolean(binaryCondition);
                }
                break;
            case "chainedBoolean":
                booleanMips += this._translateChainedBoolean(condition, jumpTo);
                break;
            default:
                return "#some error occured, got type: ".concat(condition.type, "\n");
        }
        return booleanMips;
    };
    /** Translates an if condition to equivalent mips code */
    Translate.prototype.translateIfCondition = function (condition, alternatePresent) {
        var ifConditionMips = "";
        var jumpTo = alternatePresent ? "else".concat(this.ifCounter) : "exit".concat(this.ifCounter);
        ifConditionMips += this.translateBooleanCondition(condition, jumpTo);
        if (condition.type !== "chainedBoolean") {
            ifConditionMips += "".concat(jumpTo, "\n");
        }
        return ifConditionMips;
    };
    Translate.prototype._negateComparsion = function (comparison) {
        switch (comparison) {
            case "==":
                return "!=";
            case "!=":
                return "==";
            case ">":
                return "<=";
            case ">=":
                return "<";
            case "<":
                return ">=";
            case "<=":
                return ">";
            default:
                break;
        }
    };
    Translate.prototype._translateChainedBoolean = function (condition, jumpTo) {
        if (condition.left.type === "chainedBoolean" || condition.right.type === "chainedBoolean") {
            return this._translateComplexChaninedBoolean(condition, "$t0") + "beqz $t0, ".concat(jumpTo, "\n");
        }
        else {
            return this._translateSimpleChaninedBoolean(condition, jumpTo);
        }
    };
    Translate.prototype._translateComplexChaninedBoolean = function (condition, register) {
        var chainedBooleanMips = "";
        // Evaluates the left and right hand side before comparing the bits. 0 == False and !0 is True. Left hand side should be evaluated into $s0
        // with a value of 0 indicating the expression is false and not 0 indicating true(i.e. -2 and 2 are considered true but 0 is false)
        // Similar with right hand side but with register $s1 instead
        //Translate left condition
        switch (condition.left.type) {
            case "unaryBoolean":
                chainedBooleanMips += this._evaluateUnaryBoolean(condition.left, "$s0");
                break;
            case "binaryBoolean":
                chainedBooleanMips += this._evaluateBinaryBoolean(condition.left, "$s0");
                break;
            case "chainedBoolean":
                chainedBooleanMips += this._translateComplexChaninedBoolean(condition.left, "$s0");
                break;
            default:
                break;
        }
        //Translate right condition
        switch (condition.right.type) {
            case "unaryBoolean":
                chainedBooleanMips += this._evaluateUnaryBoolean(condition.right, "$s1");
                break;
            case "binaryBoolean":
                chainedBooleanMips += this._evaluateBinaryBoolean(condition.right, "$s1");
                break;
            case "chainedBoolean":
                chainedBooleanMips += this._translateComplexChaninedBoolean(condition.right, "$s1");
                break;
            default:
                break;
        }
        if (condition.operator === "and") {
            chainedBooleanMips += "#and\nmult $s0, $s1\nmflo ".concat(register, "\n");
        }
        else {
            //or
            chainedBooleanMips += "or ".concat(register, ", $s0, $s1\n");
        }
        return chainedBooleanMips;
    };
    Translate.prototype._evaluateUnaryBoolean = function (condition, register) {
        var evaluatedUnaryMips = "";
        switch (condition.comparison.type) {
            case "int":
                evaluatedUnaryMips += "li ".concat(register, ", ").concat(condition.comparison.value, "\n");
                break;
            case "string":
                evaluatedUnaryMips += "la $a0, ".concat(condition.comparison.value, "\njal strEmpty\n#Flip the lsb so that 0 becomes 1, and 1 becomes 0\n\n                xori $t0, $v0, 1\n");
                this.functions.push('strEmpty');
                break;
            case "artihmeticExpression":
                evaluatedUnaryMips += this.translateArithmetic(condition.comparison);
                evaluatedUnaryMips += "add ".concat(register, ", $t0, $0\n");
                break;
            case "boolean":
                evaluatedUnaryMips += "li ".concat(register, ", ").concat(condition.comparison.value, "\n");
                break;
            case "variable-int":
                evaluatedUnaryMips += "lw ".concat(register, ", ").concat(condition.comparison.value, "\n");
                break;
            case "variable-string":
                evaluatedUnaryMips += "la $a0, ".concat(condition.comparison.value, "\njal strEmpty\nli $t0, $v0\n");
                this.functions.push('strEmpty');
                break;
            case "variable-boolean":
                evaluatedUnaryMips += "lw ".concat(register, ", ").concat(condition.comparison.value, "\n");
                break;
            case "variable-parameter":
                evaluatedUnaryMips += "lw ".concat(register, ", ").concat(condition.comparison.value, "\n"); //all parameters are assumed to be ints unless previously assigned
                break;
            case "arrayElement":
                evaluatedUnaryMips += "#add array element evluation for complex chained\n";
                break;
            case "function":
                evaluatedUnaryMips += "#add function evaluation for complex chained\n";
                break;
            default:
                evaluatedUnaryMips += "#Some error occured, got type: ".concat(condition.comparison.type);
                break;
        }
        return evaluatedUnaryMips;
    };
    Translate.prototype._evaluateBinaryBoolean = function (condition, register) {
        var evaluatedBinaryMips = "", leftComparand = "", rightComparand = "";
        var comparingStrings = false;
        if (condition.left.type.includes("string") || condition.right.type.includes("string")) {
            //comparing strings
            comparingStrings = true;
            leftComparand = this._translateIfConditionComparand(condition.left, '$a0');
            rightComparand = this._translateIfConditionComparand(condition.right, '$a1');
        }
        else {
            leftComparand = this._translateIfConditionComparand(condition.left, '$t2');
            rightComparand = this._translateIfConditionComparand(condition.right, '$t3');
        }
        evaluatedBinaryMips += leftComparand + rightComparand;
        switch (condition.comparison) {
            case "<":
                // a < b is the same as slt register a b
                if (comparingStrings) {
                    //if v0 == -1 then should return 1 (true) else return 0 (false)
                    evaluatedBinaryMips += "jal strCmp\nslti ".concat(register, ", $v0, 0\n");
                    this.functions.push('strCmp');
                }
                else {
                    evaluatedBinaryMips += "slt ".concat(register, ", $t2, $t3\n");
                }
                break;
            case "<=":
                // a <= b is the same as !(a > b)
                if (comparingStrings) {
                    //if v0 == 1 return 0 (false) else return 1 (true)
                    evaluatedBinaryMips += "jal strCmp\nslti ".concat(register, ", $v0, 1\n");
                    this.functions.push('strCmp');
                }
                else {
                    evaluatedBinaryMips += "slt ".concat(register, ", $t3, $t2\nxori ").concat(register, ", ").concat(register, ", 1\n");
                }
                break;
            case ">":
                // a > b is the same as slt b a
                if (comparingStrings) {
                    //if v0 == 1 return 1 (true) else return 0 (false)
                    evaluatedBinaryMips += "jal strCmp\nslt ".concat(register, ", $0, $v0\n");
                    this.functions.push('strCmp');
                }
                else {
                    evaluatedBinaryMips += "slt ".concat(register, " $t3, $t2\n");
                }
                break;
            case ">=":
                // a >= b is the same as !(a < b)
                if (comparingStrings) {
                    //if v0 == -1 then should return 0 (false) else return 1 (true)
                    evaluatedBinaryMips += "jal strCmp\nli ".concat(register, ", -1\nslt ").concat(register, ", ").concat(register, ", $v0\n");
                    this.functions.push('strCmp');
                }
                else {
                    evaluatedBinaryMips += "slt ".concat(register, " $t2, $t3\nxori ").concat(register, ", ").concat(register, ", 1\n");
                }
                break;
            case "==":
                // a == b is the same as a-b == 0
                if (comparingStrings) {
                    //if v0 == 0 then should return 1 (true) else return 0 (false)
                    evaluatedBinaryMips += "jal strCmp\nsltiu ".concat(register, ", $v0, 1\n");
                    this.functions.push('strCmp');
                }
                else {
                    evaluatedBinaryMips += "subu ".concat(register, " $t2, $t3\nsltu ").concat(register, ", $0, ").concat(register, "\nxori ").concat(register, ", ").concat(register, ", 1\n");
                }
                break;
            case "!=":
                // a != b is the same as a-b != 0
                if (comparingStrings) {
                    //if v0 == 0 then should return 0 (false) else return 1 (true)
                    evaluatedBinaryMips += "jal strCmp\nsltu ".concat(register, ", $0, $v0\n");
                    this.functions.push('strCmp');
                }
                else {
                    evaluatedBinaryMips += "subu ".concat(register, " $t2, $t3\nsltu ").concat(register, ", $0, ").concat(register, "\n");
                }
                break;
            default:
                evaluatedBinaryMips += "#some error occured got comparison ".concat(condition.comparison, "\n");
                break;
        }
        return evaluatedBinaryMips;
    };
    /** Translates simple chained if conditions i.e. if x and y: ... to mips code */
    Translate.prototype._translateSimpleChaninedBoolean = function (condition, jumpTo) {
        var chainedBooleanMips = "";
        if (condition.operator === "and") {
            //Translate left
            switch (condition.left.type) {
                case "unaryBoolean":
                    chainedBooleanMips += this._translateUnaryBoolean(condition.left, condition.left.negated);
                    chainedBooleanMips += "".concat(jumpTo, "\n");
                    break;
                case "binaryBoolean":
                    chainedBooleanMips += this._translateBinaryBoolean(condition.left);
                    chainedBooleanMips += "".concat(jumpTo, "\n");
                    break;
                default:
                    break;
            }
            //Translate right
            switch (condition.right.type) {
                case "unaryBoolean":
                    chainedBooleanMips += this._translateUnaryBoolean(condition.right, condition.left.negated);
                    chainedBooleanMips += "".concat(jumpTo, "\n");
                    break;
                case "binaryBoolean":
                    chainedBooleanMips += this._translateBinaryBoolean(condition.right);
                    chainedBooleanMips += "".concat(jumpTo, "\n");
                    break;
                default:
                    break;
            }
        }
        else {
            //or
            var negatedLeft = __assign(__assign({}, condition.left), { comparison: this._negateComparsion(condition.left.comparison) });
            console.log("NEGATED IF OR", negatedLeft);
            //Translate left
            switch (negatedLeft.type) {
                case "unaryBoolean":
                    chainedBooleanMips += this._translateUnaryBoolean(condition.left, !condition.left.negated);
                    chainedBooleanMips += "ifBody".concat(this.ifCounter, "\n");
                    break;
                case "binaryBoolean":
                    chainedBooleanMips += this._translateBinaryBoolean(negatedLeft);
                    chainedBooleanMips += "ifBody".concat(this.ifCounter, "\n");
                    break;
                default:
                    break;
            }
            //Translate right
            switch (condition.right.type) {
                case "unaryBoolean":
                    chainedBooleanMips += this._translateUnaryBoolean(condition.right, condition.left.negated);
                    chainedBooleanMips += "".concat(jumpTo, "\n");
                    break;
                case "binaryBoolean":
                    chainedBooleanMips += this._translateBinaryBoolean(condition.right);
                    chainedBooleanMips += "".concat(jumpTo, "\n");
                    break;
                default:
                    break;
            }
            chainedBooleanMips += "\nifBody".concat(this.ifCounter, ":\n");
        }
        return chainedBooleanMips;
    };
    /** Translates unary if conditions i.e. if x: ... to mips code */
    Translate.prototype._translateUnaryBoolean = function (condition, negated) {
        if (negated === void 0) { negated = false; }
        var ifUnaryBoolean = "";
        ifUnaryBoolean += this._translateIfConditionComparand(condition.comparison, "$t0");
        if (negated) {
            switch (condition.comparison.type) {
                case "int":
                    ifUnaryBoolean += "bne $t0, $0, ";
                    break;
                case "string":
                    ifUnaryBoolean += "add $a0, $t0, $0\njal strEmpty\nbeq $v0, $0, ";
                    this.functions.push('strEmpty');
                    break;
                case "artihmeticExpression":
                    ifUnaryBoolean += this.translateArithmetic(condition.comparison);
                    ifUnaryBoolean += "bne $t0, $0, ";
                    break;
                case "boolean":
                    ifUnaryBoolean += "bne $t0, $0, ";
                    break;
                case "variable-int":
                    ifUnaryBoolean += "bne $t0, $0, ";
                    break;
                case "variable-artihmeticExpression":
                    ifUnaryBoolean += "bne $t0, $0, ";
                    break;
                case "variable-string":
                    ifUnaryBoolean += "add $a0, $t0, $0\njal strEmpty\nbeq $v0, $0, ";
                    this.functions.push('strEmpty');
                    break;
                case "variable-boolean":
                    ifUnaryBoolean += "bne $t0, $0, ";
                    break;
                case "variable-parameter":
                    ifUnaryBoolean += "bne $t0, $0, ";
                    break;
                case "arrayElement":
                    ifUnaryBoolean += "#add branch for unary array elements ";
                    break;
                case "function":
                    ifUnaryBoolean += "#add branch for unary functions";
                    break;
                default:
                    break;
            }
        }
        else {
            switch (condition.comparison.type) {
                case "int":
                    ifUnaryBoolean += "beq $t0, $0, ";
                    break;
                case "string":
                    ifUnaryBoolean += "add $a0, $t0, $0\njal strEmpty\nbne $v0, $0, ";
                    this.functions.push('strEmpty');
                    break;
                case "artihmeticExpression":
                    ifUnaryBoolean += this.translateArithmetic(condition.comparison);
                    ifUnaryBoolean += "beq $t0, $0, ";
                    break;
                case "boolean":
                    ifUnaryBoolean += "beq $t0, $0, ";
                    break;
                case "variable-int":
                    ifUnaryBoolean += "beq $t0, $0, ";
                    break;
                case "variable-artihmeticExpression":
                    ifUnaryBoolean += "beq $t0, $0, ";
                    break;
                case "variable-string":
                    ifUnaryBoolean += "add $a0, $t0, $0\njal strEmpty\nbne $v0, $0, ";
                    this.functions.push('strEmpty');
                    break;
                case "variable-boolean":
                    ifUnaryBoolean += "beq $t0, $0, ";
                    break;
                case "variable-parameter":
                    ifUnaryBoolean += "beq $t0, $0, ";
                    break;
                case "arrayElement":
                    ifUnaryBoolean += "#add branch for unary array elements ";
                    break;
                case "function":
                    ifUnaryBoolean += "#add branch for unary functions";
                    break;
                default:
                    break;
            }
        }
        return ifUnaryBoolean;
    };
    /** Translates binary if conditions i.e. if x > y: ... to mips code */
    Translate.prototype._translateBinaryBoolean = function (condition) {
        var ifBinaryBoolean = "";
        //comparands are of the same type
        if (condition.left.type.includes("string")) {
            //comparands are of type string
            var leftComparand = this._translateIfConditionComparand(condition.left, '$a0');
            var rightComparand = this._translateIfConditionComparand(condition.right, '$a1');
            ifBinaryBoolean += leftComparand + rightComparand + 'jal strCmp\n';
            this.functions.push('strCmp');
            //strCmp will return v0 as 0 if a == b, 1 if a>b, -1 if a<b hqandle cases based on that
            switch (condition.comparison) {
                case "<":
                    ifBinaryBoolean += "li $t2, -1\nbne $v0, $t2, ";
                    break;
                case "<=":
                    ifBinaryBoolean += "li $t2, 1\nbeq $v0, $t2, ";
                    break;
                case ">":
                    ifBinaryBoolean += "li $t2, 1\nbne $v0, $t2, ";
                    break;
                case ">=":
                    ifBinaryBoolean += "li $t2, -1\nbeq $v0, $t2, ";
                    break;
                case "==":
                    ifBinaryBoolean += "bne $v0, $0, ";
                    break;
                case "!=":
                    ifBinaryBoolean += "beq $v0, $0, ";
                    break;
                default:
                    break;
            }
        }
        else {
            //left comparand is stored in $t1
            var leftComparand = this._translateIfConditionComparand(condition.left, '$t1');
            console.log("left", leftComparand);
            //right comparand is stored in $t2
            var rightComparand = this._translateIfConditionComparand(condition.right, '$t2');
            console.log("right", rightComparand);
            ifBinaryBoolean += leftComparand + rightComparand;
            switch (condition.comparison) {
                case "<":
                    ifBinaryBoolean += "bge $t1, $t2, ";
                    break;
                case "<=":
                    ifBinaryBoolean += "bgt $t1, $t2, ";
                    break;
                case ">":
                    ifBinaryBoolean += "ble $t1, $t2, ";
                    break;
                case ">=":
                    ifBinaryBoolean += "blt $t1, $t2, ";
                    break;
                case "==":
                    ifBinaryBoolean += "bne $t1, $t2, ";
                    break;
                case "!=":
                    ifBinaryBoolean += "beq $t1, $t2, ";
                    break;
                default:
                    break;
            }
        }
        console.log("translated", ifBinaryBoolean);
        return ifBinaryBoolean;
    };
    /** Translates the body of an if statement to equivalent mips code */
    Translate.prototype.translateIfBody = function (body) {
        var _this = this;
        var ifBodyMips = "";
        body.forEach(function (elem) {
            if (elem.token) {
                //elem is a token
                console.log("if translating", elem);
                ifBodyMips += _this.translate(elem).mipsCode;
            }
        });
        return ifBodyMips;
    };
    /** Translates comparands(things being compared) into appropriate types
     * @param register register to store the operand in i.e. '$t0'
    */
    Translate.prototype._translateIfConditionComparand = function (comparand, register) {
        var comparandMips = "";
        if (comparand.value || comparand.value === 0 || comparand.value === "") {
            //comparand in a literal i.e. 3 or "hello"
            var comparandData = comparand;
            switch (comparandData.type) {
                case "int":
                    comparandMips += "li ".concat(register, ", ").concat(comparandData.value, "\n");
                    break;
                case "string":
                    comparandMips += "la ".concat(register, ", ").concat(comparandData.value, "\n");
                    break;
                case "boolean":
                    comparandMips += "li ".concat(register, ", ").concat(comparandData.value ? "1" : "0");
                case "variable-int":
                    comparandMips += "lw ".concat(register, ", ").concat(comparandData.value, "\n");
                    break;
                case "variable-string":
                    comparandMips += "la ".concat(register, ", ").concat(comparandData.value, "\n");
                    break;
                case "variable-artihmeticExpression":
                    comparandMips += "lw ".concat(register, ", ").concat(comparandData.value, "\n");
                    break;
                case "variable-boolean":
                    comparandMips += "lw ".concat(register, ", ").concat(comparandData.value, "\n");
                    break;
                case "variable-parameter":
                    comparandMips += "lw ".concat(register, ", ").concat(comparandData.value, "\n");
                    break;
                case "variable":
                    comparandMips += "la ".concat(register, ", ").concat(comparandData.value, "\n");
                    break;
                case "arrayElement":
                    comparandMips += "#add branch for binary array elements\n";
                    var arrayElem = comparand;
                    comparandMips += "li $s0, 4\n".concat(arrayElem.value.arrayRef.allocation === "static" ? "la" : "lw", " $s1, ").concat(arrayElem.value.arrayRef.value, "\nadd $s1, $s1, $s0\n"); //get starting address of list
                    comparandMips += this._getElementIndex(arrayElem.value.index, "$s2"); //get index
                    comparandMips += "mult $s2, $s0\nmflo $s2\nadd $s2, $s2, $s1\n"; //address of element
                    comparandMips += "lw ".concat(register, ", ($s2)\n");
                    break;
                default:
                    break;
            }
        }
        else {
            //comparand is a token. 
            switch (comparand.token) {
                case "print":
                    //return error? technically python will evaluate the print and return false which i can do?
                    //unsupported for now..
                    break;
                case "input":
                    //unsupported feature so throw error
                    break;
                case "variableAssignment":
                    //throw error
                    break;
                case "ifStatement":
                    //throw erroe
                    break;
                case "stringConcatenation":
                    //also valid, but since theres a lack of temp variables this will be hard to do.... maybe unsupport?
                    break;
                case "function":
                    //this is a valid case. call the function and store the result(should be at $v0) in register
                    comparandMips += this.translateFunctionCall(comparand);
                    comparandMips += "addi ".concat(register, ", $v0, 0\n");
                    break;
                case "artihmeticExpression":
                    //this is a valid case. evaluate the expression and store result(should be at $t0) at register
                    comparandMips += this.translateArithmetic(comparand);
                    comparandMips += "addi ".concat(register, ", $t0, 0\n");
                    break;
                default:
                    break;
            }
        }
        return comparandMips;
    };
    /** Translates arithemetic tokens to mips code. Final evaluated value of the arithmetic expression is always stored
     * in register $t0 */
    Translate.prototype.translateArithmetic = function (token) {
        var _a, _b, _c, _d;
        var _this = this;
        var operations = this._postOrderArithmetic(token);
        var mipsCode = [];
        var prev = null, current = 0, next = null, usedRegisters = {}, currentRegister = -1;
        var availRegisters = ["$t0", "$t1", "$t2", "$t3", "$t4", "$t5", "$t6"];
        while (current < operations.length) {
            var currentOperationIndex = (next || next === 0) ? next : (prev || prev === 0) ? prev : current;
            var currentOperation = operations[currentOperationIndex];
            if (currentOperationIndex === operations.length - 1 && (currentOperation.left === "prevVal" && currentOperation.right === "nextVal")) {
                // console.log("FINAL REGISTRES", usedRegisters)
                // console.log("current", current)
                mipsCode.push({ operator: operations[operations.length - 1].operator, finalRegister: "$t0", overwriteRegister: true, left: { type: "register", value: usedRegisters['0'] }, right: { type: "register", value: availRegisters[currentRegister] } });
                break;
            }
            if (currentOperation.left.value && currentOperation.right.value) {
                currentRegister = (currentRegister + 1) % 7;
                mipsCode.push({ operator: currentOperation.operator, finalRegister: availRegisters[currentRegister], overwriteRegister: false, left: currentOperation.left, right: currentOperation.right });
                usedRegisters = __assign(__assign({}, usedRegisters), (_a = {}, _a[currentOperationIndex] = availRegisters[currentRegister], _a));
                current += 1;
                next = null;
            }
            else if (currentOperation.left === "prevVal" && currentOperation.right === "nextVal") {
                // console.log("PREV REGISTERS", usedRegisters)
                // console.log("CURRENT", current)
                currentRegister = (currentRegister + 1) % 2;
                mipsCode.push({ operator: currentOperation.operator, finalRegister: availRegisters[currentRegister], overwriteRegister: false, left: { type: "register", value: usedRegisters[current - 3] }, right: { type: "register", value: usedRegisters[current - 2] } });
                usedRegisters = __assign(__assign({}, usedRegisters), (_b = {}, _b[currentOperationIndex] = availRegisters[currentRegister], _b));
                current += 1;
            }
            else if (currentOperation.left === "prevVal") {
                mipsCode.push({ operator: currentOperation.operator, finalRegister: availRegisters[currentRegister], overwriteRegister: true, left: { type: "register", value: availRegisters[currentRegister] }, right: currentOperation.right });
                current += 1, next = null;
                usedRegisters = __assign(__assign({}, usedRegisters), (_c = {}, _c[currentOperationIndex] = availRegisters[currentRegister], _c));
            }
            else if (currentOperation.right === "nextVal") {
                usedRegisters = __assign(__assign({}, usedRegisters), (_d = {}, _d[currentOperationIndex] = availRegisters[currentRegister], _d));
                mipsCode.push({ operator: currentOperation.operator, finalRegister: availRegisters[currentRegister], overwriteRegister: false, left: currentOperation.left, right: { type: "register", value: usedRegisters[currentOperationIndex] } });
                current += 1, next = null;
            }
        }
        console.log("ORDERING", mipsCode.map(function (elem) { return _this._translateArithmeticOperation(elem, availRegisters[currentRegister + 1]); }).join(""));
        return mipsCode.map(function (elem) { return _this._translateArithmeticOperation(elem, availRegisters[currentRegister + 1]); }).join("");
    };
    /** Translates a single arithmetic operation to mips code*/
    Translate.prototype._translateArithmeticOperation = function (mipsOperation, recentRegister) {
        var mipsCode = "";
        // console.log("LOOK", mipsOperation)
        // console.log("FREE", recentRegister)
        var freeRegister = !mipsOperation.overwriteRegister ? recentRegister : mipsOperation.finalRegister === "$t0" ? "$t1" : "$t0";
        // console.log("FREE REG", freeRegister)
        switch (mipsOperation.operator) {
            case "+":
                mipsCode += this._arithmeticOperationToString("add", mipsOperation, freeRegister);
                break;
            case "-":
                mipsCode += this._arithmeticOperationToString("sub", mipsOperation, freeRegister);
                break;
            case "*":
                mipsCode += this._arithmeticOperationToString("mult", mipsOperation, freeRegister);
                break;
            case "/":
                mipsCode += this._arithmeticOperationToString("div", mipsOperation, freeRegister);
                break;
            case "//":
                mipsCode += this._arithmeticOperationToString("div", __assign(__assign({}, mipsOperation), { operator: "/" }), freeRegister);
                break;
            case "%":
                mipsCode += this._arithmeticOperationToString("div", mipsOperation, freeRegister);
                break;
            default:
                break;
        }
        return mipsCode;
    };
    Translate.prototype._arithmeticOperationToString = function (operatorString, mipsOperation, freeRegister) {
        // console.log(operatorString, mipsOperation.finalRegister, freeRegister)
        var mipsCode = "", leftRegister = freeRegister, rightRegister = mipsOperation.finalRegister;
        if (mipsOperation.operator === "+" || mipsOperation.operator === "-") {
            if (mipsOperation.left.type === "register" && mipsOperation.right.type === "register") {
                mipsCode += "".concat(operatorString, " ").concat(mipsOperation.finalRegister, ", ").concat(mipsOperation.left.value, ", ").concat(mipsOperation.right.value, "\n");
            }
            else {
                //left
                if (mipsOperation.left.type.includes("variable")) {
                    mipsCode += "lw ".concat(leftRegister, ", ").concat(mipsOperation.left.value, "\n");
                }
                else if (mipsOperation.left.type === "int") {
                    mipsCode += "li ".concat(leftRegister, ", ").concat(mipsOperation.left.value, "\n");
                }
                else if (mipsOperation.left.type === "register") {
                    leftRegister = mipsOperation.left.value;
                }
                //right
                if (mipsOperation.left.type === "register") {
                    if (mipsOperation.right.type.includes("variable")) {
                        mipsCode += "lw ".concat(freeRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "int") {
                        mipsCode += "li ".concat(freeRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    rightRegister = freeRegister;
                }
                else {
                    if (mipsOperation.right.type.includes("variable")) {
                        mipsCode += "lw ".concat(rightRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "int") {
                        mipsCode += "li ".concat(rightRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "register") {
                        rightRegister = mipsOperation.right.value;
                    }
                }
                mipsCode += "".concat(operatorString, " ").concat(mipsOperation.finalRegister, ", ").concat(leftRegister, ", ").concat(rightRegister, "\n");
            }
        }
        else if (mipsOperation.operator === "*" || mipsOperation.operator === "/") {
            if (mipsOperation.left.type === "register" && mipsOperation.right.type === "register") {
                mipsCode += "".concat(operatorString, " ").concat(mipsOperation.left.value, ", ").concat(mipsOperation.right.value, "\nmflo ").concat(mipsOperation.finalRegister, "\n");
            }
            else {
                //left
                if (mipsOperation.left.type.includes("variable")) {
                    mipsCode += "lw ".concat(leftRegister, ", ").concat(mipsOperation.left.value, "\n");
                }
                else if (mipsOperation.left.type === "int") {
                    mipsCode += "li ".concat(leftRegister, ", ").concat(mipsOperation.left.value, "\n");
                }
                else if (mipsOperation.left.type === "register") {
                    leftRegister = mipsOperation.left.value;
                }
                //right
                if (mipsOperation.left.type === "register") {
                    if (mipsOperation.right.type.includes("variable")) {
                        mipsCode += "lw ".concat(freeRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "int") {
                        mipsCode += "li ".concat(freeRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    rightRegister = freeRegister;
                }
                else {
                    if (mipsOperation.right.type.includes("variable")) {
                        mipsCode += "lw ".concat(rightRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "int") {
                        mipsCode += "li ".concat(rightRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "register") {
                        rightRegister = mipsOperation.right.value;
                    }
                }
                mipsCode += "".concat(operatorString, " ").concat(leftRegister, ", ").concat(rightRegister, "\nmflo ").concat(mipsOperation.finalRegister, "\n");
            }
        }
        else if (mipsOperation.operator === "%") {
            if (mipsOperation.left.type === "register" && mipsOperation.right.type === "register") {
                mipsCode += "".concat(operatorString, " ").concat(mipsOperation.left.value, ", ").concat(mipsOperation.right.value, "\nmflo ").concat(mipsOperation.finalRegister, "\n");
            }
            else {
                //left
                if (mipsOperation.left.type.includes("variable")) {
                    mipsCode += "lw ".concat(leftRegister, ", ").concat(mipsOperation.left.value, "\n");
                }
                else if (mipsOperation.left.type === "int") {
                    mipsCode += "li ".concat(leftRegister, ", ").concat(mipsOperation.left.value, "\n");
                }
                else if (mipsOperation.left.type === "register") {
                    leftRegister = mipsOperation.left.value;
                }
                //right
                if (mipsOperation.left.type === "register") {
                    if (mipsOperation.right.type.includes("variable")) {
                        mipsCode += "lw ".concat(freeRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "int") {
                        mipsCode += "li ".concat(freeRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    rightRegister = freeRegister;
                }
                else {
                    if (mipsOperation.right.type.includes("variable")) {
                        mipsCode += "lw ".concat(rightRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "int") {
                        mipsCode += "li ".concat(rightRegister, ", ").concat(mipsOperation.right.value, "\n");
                    }
                    else if (mipsOperation.right.type === "register") {
                        rightRegister = mipsOperation.right.value;
                    }
                }
                mipsCode += "".concat(operatorString, " ").concat(leftRegister, ", ").concat(rightRegister, "\nmfhi ").concat(mipsOperation.finalRegister, "\n");
            }
        }
        return mipsCode;
    };
    /** Traverses through a parsed arithmetic sequence and returns a more readable result in the correct order */
    Translate.prototype._postOrderArithmetic = function (root) {
        var result = [];
        var node = root;
        //not typed to avoid the headache of having to cast each node value
        var traverse = function (node) {
            if (node.properties) {
                traverse(node.properties.left);
                traverse(node.properties.right);
                if (node.properties.left.token) {
                    var nodeValue = { operator: node.properties.operator, left: "prevVal", right: node.properties.right };
                    if (node.properties.right.token) {
                        nodeValue = __assign(__assign({}, nodeValue), { right: "nextVal" });
                    }
                    result.push(nodeValue);
                }
                else if (node.properties.right.token) {
                    var nodeValue = { operator: node.properties.operator, left: node.properties.left, right: "nextVal" };
                    result.push(nodeValue);
                }
                else {
                    result.push(node.properties);
                }
            }
        };
        traverse(node);
        return result;
    };
    ;
    /** Translates assignments. Stores in register */
    Translate.prototype._loadValueIntoRegister = function (assignmentType, register, initialDeclaration) {
        if (register === void 0) { register = "$t0"; }
        if (initialDeclaration === void 0) { initialDeclaration = false; }
        var assignmentMips = "";
        if (assignmentType.value !== undefined && !initialDeclaration) {
            var dataObj = assignmentType;
            switch (dataObj.type) {
                case "string":
                    //this variable is being reused later, hence need to load each character one by one into the buffer
                    // variableAssignmentMips += `#WARNING DUE TO REASSINGING THIS STRING TYPE VARIABLE SOMEWHERE IN YOUR CODE, MIPS HAS TO LOAD EACH CHARACTER OF THE STRING INTO THE LABEL ADDRESS.
                    // THIS RESULTS IN EXTREMELY LONG MIPS CODE.`
                    assignmentMips += "la $s0, ".concat(register, "\n") + this._storeStringInMips(dataObj.value, register);
                    break;
                case "int":
                    assignmentMips += "li ".concat(register, ", ").concat(dataObj.value, "\n");
                    break;
                case "boolean":
                    assignmentMips += "li ".concat(register, ", ").concat(dataObj.value ? "1" : "0", "\n");
                    break;
                case "variable-int":
                    assignmentMips += "lw ".concat(register, ", ").concat(dataObj.value, "\n");
                    break;
                case "variable-boolean":
                    assignmentMips += "lw ".concat(register, ", ").concat(dataObj.value, "\n");
                    break;
                case "variable-artihmeticExpression":
                    assignmentMips += "lw ".concat(register, ", ").concat(dataObj.value, "\n");
                    break;
                case "variable-string":
                    assignmentMips += "la $s0, ".concat(register, "\nadd $a0, $s0, $0\nla $a1, ").concat(dataObj.value, "\njal strConcat\n");
                    break;
                case "variable-parameter":
                    assignmentMips += "lw ".concat(register, ", ").concat(dataObj.value, "\n");
                    break;
                case "arrayElement":
                    var arrayElem = assignmentType;
                    assignmentMips += "li $t0, 4\n".concat(arrayElem.value.arrayRef.allocation === "static" ? "la" : "lw", " $t1, ").concat(arrayElem.value.arrayRef.value, "\nadd $t1, $t1, $t0\n"); //get starting address of list
                    assignmentMips += this._getElementIndex(arrayElem.value.index, "$t2"); //get index
                    assignmentMips += "mult $t2, $t0\nmflo $t2\nadd $t2, $t2, $t1\n"; //address of element
                    assignmentMips += "lw ".concat(register, ", ($t2)\n"); //load elem
                    break;
                default:
                    break;
            }
        }
        // else if ((assignmentType as StringConcatenationToken).token === "stringConcatenation") {
        //     // Token is a string concatenation i.e. s = "hello" + "world"
        //     const stringConcatenationToken = assignmentType as StringConcatenationToken;
        //     const variable = register
        //     const addedStrings = (stringConcatenationToken.properties as StringConcatProperties).addedStrings
        //     //check if adding variable to itself i.e. x = x + "some stuff"
        //     assignmentMips += addedStrings[0].type === "variable" && (addedStrings[0].value === variable)
        //         ? `la $s0, ${variable}\naddi $s0, $s0, ${token.properties.space - 1}\n`
        //         : `la $s0, ${variable}\n`;
        //     assignmentMips += this.translateStringConcatenation(stringConcatenationToken, variable);
        // }
        else if (assignmentType.token === "function") {
            var functionToken = assignmentType;
            assignmentMips += this.translateFunctionCall(functionToken);
            assignmentMips += "addi ".concat(register, ", $v0, 0");
        }
        else if (assignmentType.token === "array") {
            var arrayToken = assignmentType;
            assignmentMips += this.allocateArray(arrayToken, register);
        }
        else if (assignmentType.token === "input") {
            // Token is an input()
            console.log("INPUT", assignmentType);
            console.log("VARIABLE", register);
            var inputToken = assignmentType;
            assignmentMips += this.translateInput(inputToken, register);
        }
        else if (assignmentType.token === "artihmeticExpression") {
            // Token is an arithmetic expression
            //console.log("TRAVERSING ARITHMETIC", this._postOrderArithmetic(assignmentType as ArtihmeticExpressionToken));
            var arithemeticExpression = assignmentType;
            assignmentMips += this.translateArithmetic(arithemeticExpression);
            if (register !== "$t0")
                assignmentMips += "addi ".concat(register, ", $t0, 0\n");
        }
        return assignmentMips;
    };
    return Translate;
}());
export default Translate;
