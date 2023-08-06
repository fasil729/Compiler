"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ArrayLength = exports.FunctionDeclarationToken = exports.FunctionToken = exports.ArrayElement = exports.ArrayOperation = exports.ArrayToken = exports.LoopBreakToken = exports.LoopToken = exports.IfToken = exports.ArtihmeticExpressionToken = exports.StringConcatenationToken = exports.VariableAssignmentToken = exports.VariableAssignmentDataObject = exports.InputToken = exports.PrintToken = exports.Token = exports.DataObject = void 0;
var DataObject = /** @class */ (function () {
    function DataObject() {
    }
    return DataObject;
}());
exports.DataObject = DataObject;
var Token = /** @class */ (function () {
    function Token() {
    }
    return Token;
}());
exports.Token = Token;
var PrintToken = /** @class */ (function () {
    function PrintToken() {
    }
    return PrintToken;
}());
exports.PrintToken = PrintToken;
var InputToken = /** @class */ (function () {
    function InputToken() {
    }
    return InputToken;
}());
exports.InputToken = InputToken;
var VariableAssignmentDataObject = /** @class */ (function (_super) {
    __extends(VariableAssignmentDataObject, _super);
    function VariableAssignmentDataObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VariableAssignmentDataObject;
}(DataObject));
exports.VariableAssignmentDataObject = VariableAssignmentDataObject;
var VariableAssignmentToken = /** @class */ (function () {
    function VariableAssignmentToken() {
    }
    return VariableAssignmentToken;
}());
exports.VariableAssignmentToken = VariableAssignmentToken;
var StringConcatenationToken = /** @class */ (function () {
    function StringConcatenationToken() {
    }
    return StringConcatenationToken;
}());
exports.StringConcatenationToken = StringConcatenationToken;
var ArtihmeticExpressionToken = /** @class */ (function () {
    function ArtihmeticExpressionToken() {
    }
    return ArtihmeticExpressionToken;
}());
exports.ArtihmeticExpressionToken = ArtihmeticExpressionToken;
var IfToken = /** @class */ (function () {
    function IfToken() {
    }
    return IfToken;
}());
exports.IfToken = IfToken;
var LoopToken = /** @class */ (function () {
    function LoopToken() {
    }
    return LoopToken;
}());
exports.LoopToken = LoopToken;
var LoopBreakToken = /** @class */ (function () {
    function LoopBreakToken() {
    }
    return LoopBreakToken;
}());
exports.LoopBreakToken = LoopBreakToken;
var ArrayToken = /** @class */ (function () {
    function ArrayToken() {
    }
    return ArrayToken;
}());
exports.ArrayToken = ArrayToken;
var ArrayOperation = /** @class */ (function () {
    function ArrayOperation() {
    }
    return ArrayOperation;
}());
exports.ArrayOperation = ArrayOperation;
var ArrayElement = /** @class */ (function () {
    function ArrayElement() {
    }
    return ArrayElement;
}());
exports.ArrayElement = ArrayElement;
var FunctionToken = /** @class */ (function () {
    function FunctionToken() {
    }
    return FunctionToken;
}());
exports.FunctionToken = FunctionToken;
var FunctionDeclarationToken = /** @class */ (function () {
    function FunctionDeclarationToken() {
    }
    return FunctionDeclarationToken;
}());
exports.FunctionDeclarationToken = FunctionDeclarationToken;
var ArrayLength = /** @class */ (function (_super) {
    __extends(ArrayLength, _super);
    function ArrayLength() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ArrayLength;
}(FunctionToken));
exports.ArrayLength = ArrayLength;
