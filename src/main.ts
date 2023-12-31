import { SyntaxError, parse } from './pythonParser';
import Translate from './translator';
import { Token } from './objects/tokens';
import { mipsFunctions } from './mipsFunction';

const testStringPrint = `print("hello"); x = 2;\nprint(x+2)\nx=input("type something:"); print(x); `
const testPrint = `print(2)\nprint("hello")\nprint("hello", "world")\nprint(2+2)\nprint(9*30/5 + 32)`
const testArPrint = `print(2 + (9*30/5 + 32))`
const testInput = `x = int(input("enter a number: "))\nprint("adding 10 to your number:", x)\nx=10 + x\nprint(x)`
const testSimpleInput = `input()`
const testVarAssign = `name = input('Enter name (max 60 chars): ')\nprint('Hello ' + name)\nage = int(input("enter your age"))\nprint(age)`
const testVarAssignComplex = `temp_C = int(input('Enter temperature in Celsius '))\ntemp_F = int(9*temp_C/5 + 32)\nprint('Temperature in Fahrenheit is ' + str(temp_F))`
const testStrConcat = `x = "hello"; y="am i doing something wrong?"; print(x); x = "hello young luke skywalker" + " " + y; print(x); print(y); x = "reset"; print(x)`
const testSaveSpaceStrConcat = `x="hello";print("initial x:", x);x += " world"; print("Final x:", x)`
const testChangingVarTypes = `x=3; print(x); x=x+2*5; print(x); Y="hello"; print(Y)`
const testNewStringCOncat = `x="hello"; y="world"; x = x + y*2 +"WOW"*4; print(x); x=2;y=2; x = x+y*2; print(x)`
const testBug = `x = "hello"; y="am i doing something wrong?"; print(x); x = "hello young luke skywalker" + " " + y; print(x); print(y); x = "reset"; print(x + "am i doing something wrong?" + " ")`
const testSimpleIf = `n = int(input("Enter int: "));
if n < 0:
    print("negative")`
const testSimpleIf2 = `n = int(input("Enter int: "))
if (n % 2 == 0):
 print(n, 'is even')
else:
 print(n, 'is odd')

print("ending the program now")`
const testMyIf = `x = "hello"
print("x is: ", x)
z = input("Add world?")
if z == "y":
    x += "world"
    print("you added world, now x is: ", x)
else:
    print("you did not add world, x is still: ", x)`
const wtf = `x = 10; y = 0
if x == 0:
    if y == 10:
        print("equal")
    else:
        print("not equal")
else:
    if x == 10:
        if y == 0:
            print("equal")
        else:
            print("not equal")
    else:
        print("not equal")`
const unaryIf = `x = 10
if x:
    print(x)
else:
    print("x is 0")
`
const bug_test = `x = ""
if x:
    print("x is not empty")
else:
    print("x is empty")`
const bug_test1 = `x = input("enter x: ")
y = input("enter y: ")
if x:
    if y:
        print("x and y are not empty")
    else:
        print("y is empty but x is not")
else:
    if y:
        print("x is empty but y is not")
    else:
        print("x and y are empty")`
const leap_year = `year=int(input("Enter year to be checked:"))
if(year%4==0 and year%100!=0 or year%400==0):
    print("The year is a leap year!")
else:
    print("The year isn't a leap year!")`
const testSimpleChained = `x = 10; y= 5
if x % 5 == 0 or y % 5 == 0:
    print(x//y)
else:
    print("either x and y is not divisible by 5")`
const testBoolean = `x = False
if x:
    print(x)
else:
    x = True
    if x:
        print("Now x is ", x)`
const testNotIf = `x = 2010
if x > 10 and x % 5 == 0 and not x == 5:
    print("x is not 5 but is divisible by 5 and bigger than 10")
else:
    print("x is either 5, not divisible by 5, or smaller than 10")
`
const whileLoop = `x = 1
while x+1 < 5:
    y = 1
    print(x)
    while y < 3:
        print(y)
        y+=1
    x+=1
print("done loop")`
const forLoop = `y = int(input("how many times to repeat?"))
for x in range(y):
    print("hello world")
for x in range(0,10,2):
    print(x)`
const nestedFor = `for i in range(3):
    for j in range(i, 3):
        print(i, j)`
const loopBreaks = `i = 1
j = 0
while i < 6:        
    print(i)
    while j < 6:  
        j += 1 
        print(j)
        if j == 3:
            continue
        break
    i += 1

while i <= 12:
    i+=1
    if i == 9:
        continue
    print("second i", i)`
const mipsTest1 = `n = int(input("Enter integer: "))
while (n > 1):
    print(n)
    if n % 2 == 0:
        n = n//2
    else:
        n = 3*n + 1`
const arrOpTest = `size = int(input("Enter size: "))
the_list = [0] * size
for i in range(size):
    the_list[i] = int(input("Enter value: "))
print(the_list)
print(the_list[0])
print(len(the_list))
`
const insertionSort = `# Driver code to test above
arr = [12, 11, 13, 5, 6] #array

# Traverse through 1 to len(arr) 
for i in range(1, len(arr)): 
    key = arr[i]
    # Move elements of arr[0..i-1], that are
    # greater than key, to one position ahead
    # of their current position 
    j = i-1
    while j >=0 and key < arr[j]: 
        arr[j+1] = arr[j] 
        j -= 1
    arr[j+1] = key
print(arr)`
const insertionSoryDynamic = `# Driver code to test above 
size = int(input("Enter size: "))
arr = [0] * size

for i in range(len(arr)):
    arr[i] = int(input("Element: "))

# Traverse through 1 to len(arr) 
for i in range(1, len(arr)): 

    key = arr[i] 
    # Move elements of arr[0..i-1], that are 
    # greater than key, to one position ahead 
    # of their current position 

    j = i-1

    while j >=0 and key < arr[j]: 
        arr[j+1] = arr[j] 
        j -= 1
    arr[j+1] = key

print(arr)`
const functionTest = `def main():
    base = 0
    exp = 0
    result = 0  
    base = int(input())
    exp = int(input())
    result = power(base, exp) 
    print(result)
def power(b, e):
    result = 1
    while e > 0:
        result *= b
        e -= 1
    return result
main()`
const simpleFunction = `g = 123
def main():
    a = -5
    b = 0
    c = 230
    b=g+a
    print(c-a)
main()`

const testCase =  ` print("hello world")`

export interface parserOutput {
    data: Array<string>;
    tokens: Array<Token>;
}

const compareDataSegment = (a: string, b: string) => {
    if(a.slice(a.indexOf(".") + 1, a.indexOf(".") + 6) === "space") {
        return -1
    }
    if(b.slice(b.indexOf(".") + 1, b.indexOf(".") + 6) === "space") {
        return 1
    }
    return a.slice(a.indexOf(".") + 1) > b.slice(b.indexOf(".")) + 1 ? 1 : -1
}

export default function translatePython(sourceCode: string) {
    console.log(sourceCode.split("\n").filter(elem => elem !== '').join('\n'))
    const trimmedSource = sourceCode.split("\n").filter(elem => elem !== '').join('\n')
    try {
        const pyTranslator = new Translate();
        const sampleOutput: parserOutput = parse(trimmedSource) as parserOutput;
        // console.log(sampleOutput)
        const text:string[] = []
        let functions!:{userDefined: Array<string>, inBuilt: Array<string>};
        sampleOutput.tokens.forEach(elem => {
            // console.log("token: ", elem)
            let translated = pyTranslator.translate(elem)
            text.push(translated.mipsCode)
            functions = {...translated.functions}
        })
        console.log("#-----------------------------------------++++++++++++++++")
        console.log("#++++++++++++++++++++++++++++++++++++++--------------")
        console.log(sampleOutput.data.sort(compareDataSegment))
        console.log(text)
        console.log(".data")
        sampleOutput.data.map(elem => console.log(elem));
        console.log("#now here----------------------------------------------")
        console.log("\n.text")
        text.filter(elem => elem === '' ? false : true).forEach(elem => console.log(elem));
        console.log("addi $v0, $0, 10\nsyscall\n") //exit
        if (functions.userDefined.length) {
            console.log("# User Defined Functions");
            functions.userDefined.forEach(func => console.log(func))
        }
        functions.inBuilt.filter((item, index) => functions.inBuilt.indexOf(item) >= index).forEach(elem => console.log(mipsFunctions[elem] ? mipsFunctions[elem] : ""));
    }
    catch (e) {
        console.log(e)
    }
}

