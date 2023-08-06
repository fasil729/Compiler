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

const inputField = document.getElementById('python');
const outputField = document.getElementById('mips');

export const __esModule = true;
import { parse } from "./pythonParser.js";
import translator_1 from "./translator.js";
import { mipsFunctions }  from "./mipsFunction.js";
var testStringPrint = "print(\"hello\"); x = 2;\nprint(x+2)\nx=input(\"type something:\"); print(x); ";
var testPrint = "print(2)\nprint(\"hello\")\nprint(\"hello\", \"world\")\nprint(2+2)\nprint(9*30/5 + 32)";
var testArPrint = "print(2 + (9*30/5 + 32))";
var testInput = "x = int(input(\"enter a number: \"))\nprint(\"adding 10 to your number:\", x)\nx=10 + x\nprint(x)";
var testSimpleInput = "input()";
var testVarAssign = "name = input('Enter name (max 60 chars): ')\nprint('Hello ' + name)\nage = int(input(\"enter your age\"))\nprint(age)";
var testVarAssignComplex = "temp_C = int(input('Enter temperature in Celsius '))\ntemp_F = int(9*temp_C/5 + 32)\nprint('Temperature in Fahrenheit is ' + str(temp_F))";
var testStrConcat = "x = \"hello\"; y=\"am i doing something wrong?\"; print(x); x = \"hello young luke skywalker\" + \" \" + y; print(x); print(y); x = \"reset\"; print(x)";
var testSaveSpaceStrConcat = "x=\"hello\";print(\"initial x:\", x);x += \" world\"; print(\"Final x:\", x)";
var testChangingVarTypes = "x=3; print(x); x=x+2*5; print(x); Y=\"hello\"; print(Y)";
var testNewStringCOncat = "x=\"hello\"; y=\"world\"; x = x + y*2 +\"WOW\"*4; print(x); x=2;y=2; x = x+y*2; print(x)";
var testBug = "x = \"hello\"; y=\"am i doing something wrong?\"; print(x); x = \"hello young luke skywalker\" + \" \" + y; print(x); print(y); x = \"reset\"; print(x + \"am i doing something wrong?\" + \" \")";
var testSimpleIf = "n = int(input(\"Enter int: \"));\nif n < 0:\n    print(\"negative\")";
var testSimpleIf2 = "n = int(input(\"Enter int: \"))\nif (n % 2 == 0):\n print(n, 'is even')\nelse:\n print(n, 'is odd')\n\nprint(\"ending the program now\")";
var testMyIf = "x = \"hello\"\nprint(\"x is: \", x)\nz = input(\"Add world?\")\nif z == \"y\":\n    x += \"world\"\n    print(\"you added world, now x is: \", x)\nelse:\n    print(\"you did not add world, x is still: \", x)";
var wtf = "x = 10; y = 0\nif x == 0:\n    if y == 10:\n        print(\"equal\")\n    else:\n        print(\"not equal\")\nelse:\n    if x == 10:\n        if y == 0:\n            print(\"equal\")\n        else:\n            print(\"not equal\")\n    else:\n        print(\"not equal\")";
var unaryIf = "x = 10\nif x:\n    print(x)\nelse:\n    print(\"x is 0\")\n";
var bug_test = "x = \"\"\nif x:\n    print(\"x is not empty\")\nelse:\n    print(\"x is empty\")";
var bug_test1 = "x = input(\"enter x: \")\ny = input(\"enter y: \")\nif x:\n    if y:\n        print(\"x and y are not empty\")\n    else:\n        print(\"y is empty but x is not\")\nelse:\n    if y:\n        print(\"x is empty but y is not\")\n    else:\n        print(\"x and y are empty\")";
var leap_year = "year=int(input(\"Enter year to be checked:\"))\nif(year%4==0 and year%100!=0 or year%400==0):\n    print(\"The year is a leap year!\")\nelse:\n    print(\"The year isn't a leap year!\")";
var testSimpleChained = "x = 10; y= 5\nif x % 5 == 0 or y % 5 == 0:\n    print(x//y)\nelse:\n    print(\"either x and y is not divisible by 5\")";
var testBoolean = "x = False\nif x:\n    print(x)\nelse:\n    x = True\n    if x:\n        print(\"Now x is \", x)";
var testNotIf = "x = 2010\nif x > 10 and x % 5 == 0 and not x == 5:\n    print(\"x is not 5 but is divisible by 5 and bigger than 10\")\nelse:\n    print(\"x is either 5, not divisible by 5, or smaller than 10\")\n";
var whileLoop = "x = 1\nwhile x+1 < 5:\n    y = 1\n    print(x)\n    while y < 3:\n        print(y)\n        y+=1\n    x+=1\nprint(\"done loop\")";
var forLoop = "y = int(input(\"how many times to repeat?\"))\nfor x in range(y):\n    print(\"hello world\")\nfor x in range(0,10,2):\n    print(x)";
var nestedFor = "for i in range(3):\n    for j in range(i, 3):\n        print(i, j)";
var loopBreaks = "i = 1\nj = 0\nwhile i < 6:        \n    print(i)\n    while j < 6:  \n        j += 1 \n        print(j)\n        if j == 3:\n            continue\n        break\n    i += 1\n\nwhile i <= 12:\n    i+=1\n    if i == 9:\n        continue\n    print(\"second i\", i)";
var mipsTest1 = "n = int(input(\"Enter integer: \"))\nwhile (n > 1):\n    print(n)\n    if n % 2 == 0:\n        n = n//2\n    else:\n        n = 3*n + 1";
var arrOpTest = "size = int(input(\"Enter size: \"))\nthe_list = [0] * size\nfor i in range(size):\n    the_list[i] = int(input(\"Enter value: \"))\nprint(the_list)\nprint(the_list[0])\nprint(len(the_list))\n";
var insertionSort = "# Driver code to test above\narr = [12, 11, 13, 5, 6] #array\n\n# Traverse through 1 to len(arr) \nfor i in range(1, len(arr)): \n    key = arr[i]\n    # Move elements of arr[0..i-1], that are\n    # greater than key, to one position ahead\n    # of their current position \n    j = i-1\n    while j >=0 and key < arr[j]: \n        arr[j+1] = arr[j] \n        j -= 1\n    arr[j+1] = key\nprint(arr)";
var insertionSoryDynamic = "# Driver code to test above \nsize = int(input(\"Enter size: \"))\narr = [0] * size\n\nfor i in range(len(arr)):\n    arr[i] = int(input(\"Element: \"))\n\n# Traverse through 1 to len(arr) \nfor i in range(1, len(arr)): \n\n    key = arr[i] \n    # Move elements of arr[0..i-1], that are \n    # greater than key, to one position ahead \n    # of their current position \n\n    j = i-1\n\n    while j >=0 and key < arr[j]: \n        arr[j+1] = arr[j] \n        j -= 1\n    arr[j+1] = key\n\nprint(arr)";
var functionTest = "def main():\n    base = 0\n    exp = 0\n    result = 0  \n    base = int(input())\n    exp = int(input())\n    result = power(base, exp) \n    print(result)\ndef power(b, e):\n    result = 1\n    while e > 0:\n        result *= b\n        e -= 1\n    return result\nmain()";
var simpleFunction = "g = 123\ndef main():\n    a = -5\n    b = 0\n    c = 230\n    b=g+a\n    print(c-a)\nmain()";
var testCase = " print(\"hello world\")";
var compareDataSegment = function (a, b) {
    if (a.slice(a.indexOf(".") + 1, a.indexOf(".") + 6) === "space") {
        return -1;
    }
    if (b.slice(b.indexOf(".") + 1, b.indexOf(".") + 6) === "space") {
        return 1;
    }
    return a.slice(a.indexOf(".") + 1) > b.slice(b.indexOf(".")) + 1 ? 1 : -1;
};

function translatePython(sourceCode) {
    // console.log(sourceCode.split("\n").filter(function (elem) { return elem !== ''; }).join('\n'));
    var trimmedSource = sourceCode.split("\n").filter(function (elem) { return elem !== ''; }).join('\n');
    try {
        var pyTranslator_1 = new translator_1();
        var sampleOutput = (0, parse)(trimmedSource);
        // console.log(sampleOutput)
        var text_1 = [];
        var functions_1;
        sampleOutput.tokens.forEach(function (elem) {
            // console.log("token: ", elem)
            var translated = pyTranslator_1.translate(elem);
            text_1.push(translated.mipsCode);
            functions_1 = __assign({}, translated.functions);
        });
        // console.log(sampleOutput.data.sort(compareDataSegment));
        // console.log(text_1);
        outputField.innerHTML = "";
        console.log(".data");
        outputField.innerHTML += ".data\n"
        sampleOutput.data.map(function (elem) { return console.log(elem),outputField.innerHTML += elem; });
        // sampleOutput.data.map(function (elem) { return console.log(elem); });
        console.log("\n.text");
        outputField.innerHTML += "\n.text\n";
        text_1.filter(function (elem) { return elem === '' ? false : true; }).forEach(function (elem) { return outputField.innerHTML += elem; });
        // text_1.filter(function (elem) { return elem === '' ? false : true; }).forEach(function (elem) { return console.log(elem) });
        // console.log("\naddi $v0, $0, 10\nsyscall\n"); //exit
        outputField.innerHTML += "\n";
        outputField.innerHTML += "addi $v0, $0, 10\nsyscall\n";
        if (functions_1.userDefined.length) {
            console.log("# User Defined Functions");
            outputField.innerHTML += "# User Defined Functions\n";
            functions_1.userDefined.forEach(function (func) { return outputField.innerHTML += func; });
            // functions_1.userDefined.forEach(function (func) { return console.log(func) });
        }
        functions_1.inBuilt.filter(function (item, index) { return outputField.innerHTML += mipsFunctions[elem] ? mipsFunctions[elem] : ""; });
        // functions_1.inBuilt.filter(function (item, index) { return console.log(mipsFunctions[elem] ? mipsFunctions[elem] : ""); });
    }
    catch (e) {
        console.log(e);
    }
}
export default translatePython;


const runButton = document.getElementById("run").addEventListener("click",function () {
    const code = inputField.value;
    translatePython(code);
});



