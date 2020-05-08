let TO_RAD = 3.14 / 180;
let operators = ['+', '-', '/', 'x']; // we will always display 'x' instead of '*'
let reArith = /\d*[+-/*x]\d*/; // for detecting standard arithmetic questions
let reTrig = /^\b(sin|cos|tan)\b/; // for detecting trigonometry questions

function submit() {

    // why is this function so big?
    // because it is designed to be as scalable as possible
    // it could handle infinite randomly generated math questions
    // provided that the questions are either basic arithmetic with only one operator
    // or trigonometry questions (sin, cos, tan) with a number in the brackets

    let questions = document.getElementsByClassName("question")

    // number of questions the user got right
    let numCorrect = 0;

    for (let i = 0; i < questions.length; i++) {

        // get child nodes so we can get the math problem text, selected input and input label value
        let children = questions[i].childNodes;
        
        // stores the (processed) contents of the <h2> tag
        let mathProblem = "";

        let isTrig = false;
        let isArith = false;

        // we will evaluate this later
        let correctAnswer = null;

        let userAnswer = null;

        for (let j = 0; j < children.length; j++) {
            
            // check for h2 tag, only if we have not already obtained the math problem
            if (children[j].tagName == "H2" && mathProblem == "") {
                let innerHTML = children[j].innerHTML;

                // iterate through math problem string
                for (let k = 0; k < innerHTML.length; k++) {
                    
                    // remove spaces from math problem
                    if (innerHTML[k] != ' ') {
                        mathProblem += innerHTML[k];
                    }
                }
                
                if (mathProblem.includes("=")) {
                    mathProblem = mathProblem.split("=")[0].trim();
                    console.log(mathProblem);
                }
                
                // check arithmetic match
                if (reArith.test(mathProblem)) {
                    isArith = true;
                }

                // check trig match
                if (reTrig.test(mathProblem)) {
                    isTrig = true;
                }

            }

            // get userAnswer 
            let labelsAndInputs = getLabelsAndInputs();
            for (let k = 0; k <= 2; k++) {
                let idx = k + (i * 3);
                let inputElement = labelsAndInputs[idx][1];
                if (inputElement.tagName == "INPUT" && inputElement.checked && userAnswer == null) {
                    selectedId = inputElement.id;
                    if (labelsAndInputs[idx][0].tagName == "LABEL" && labelsAndInputs[idx][0].getAttribute("for") == "#" + selectedId) {
                        userAnswer = labelsAndInputs[idx][0].innerHTML;
                        //console.log(userAnswer);
                    }
                }
            }
            
        }

        if (userAnswer == null) {
            // this means that not all questions have been answered
            document.getElementById("resultLabel").innerHTML = "Please answer all questions.";
            return;
        }

        // now evaluate what the correct answer to the math problem is
        if (isTrig == true && correctAnswer == null) {

                // sin(90) - we want the name of function 'sin' and the number '90'

                // split based on open bracket will look like ['sin', '90)']
                let parts = mathProblem.split("("); 
                // so remove the bracket from '90)'
                let value = Number(parts[1].substring(0, parts[1].length - 1)); 
                // take the name of function
                let func = parts[0];                                                    

                // evaluate correct answer to 1 decimal place
                switch(func) {
                    case "sin":
                        correctAnswer = Math.sin(value * TO_RAD).toFixed(1);
                        break;
                    case "cos":                                
                        correctAnswer = Math.cos(value * TO_RAD).toFixed(1);
                        break;
                    case "tan":                                    
                        correctAnswer = Math.tan(value * TO_RAD).toFixed(1);
                        break;
                    default:
                        // this should never execute because of the regular expression check
                        console.log("error: unknown trig function");
                }

                if (correctAnswer > 1) {
                    correctAnswer = "inf";
                }

                // we have the result of the trig function
                if (correctAnswer != null) {
                    //console.log("result: " + correctAnswer);
                }
        }
        else if (isArith == true && correctAnswer == null) {
            
            // first extract the operator +-x/
            let operator = null;
            for (let k = 0; k < operators.length; k++) {
                if (mathProblem.includes(operators[k])) {
                    operator = operators[k];
                    break;
                }
            }
            if (operator != null) {
                // split based on the operator to get the operands
                let num1 = mathProblem.split(operator)[0];
                let num2 = mathProblem.split(operator)[1];
                
                // evaluate correct answer
                switch(operator) {
                    case "+":
                        correctAnswer = Number(num1) + Number(num2);
                        break;
                    case "-":
                        correctAnswer = Number(num1) - Number(num2);
                        break;
                    case "x":
                        correctAnswer = Number(num1) * Number(num2);
                        break;
                    case "/":
                        correctAnswer = Number(num1) / Number(num2);
                        break;
                }

                if (correctAnswer != null) {
                    //console.log("result: " + correctAnswer);
                }
            }
        }

        // clean user answer if it contains fancy squareroot html or forward-slash
        let clean = parseFancyHTML(userAnswer);
        if (clean != null) {
            userAnswer = clean;
        }

        // check if userAnswer matches correctAnswer
        if (userAnswer == Number(correctAnswer) || userAnswer == "inf" && correctAnswer == "inf") {
            console.log("correct: " + userAnswer + "=" + correctAnswer);
            numCorrect += 1;
        }
        else {
            console.log("incorrect: " + userAnswer + "!=" + correctAnswer);
        }

        // display results
        document.getElementById("resultLabel").innerHTML = "Result: " + numCorrect + '/' + questions.length;

    }

    //return;
}

function parseFancyHTML(rawHTML) {
    let result = null;

    if (rawHTML.includes("<msqrt>")) {
        // we use fancy html to display sqrt symbol
        // <math><msqrt><mi>3</mi></msqrt></math>
        // get the values from that html

        // first get the value between the <mi> and </mi> tags
        let sqrtNum = rawHTML.split("<mi>")[1].split("</mi>")[0];
        

        // sometimes there will be another value at the end
        // <math><msqrt><mi>3</mi></msqrt></math>/2
        // the above means sqrt(3) divided by 2
        let otherNum = rawHTML.split("</math>/")[1];
        
        // this otherNum won't always be there
        if (otherNum != undefined) {
            result = Math.sqrt(sqrtNum) / otherNum; 
        }
        else {
            result = Math.sqrt(sqrtNum);
        }

        //console.log("before: " + result);
        result = result.toFixed(1);
        //console.log("after: " + result);

        if (rawHTML[0] == '-') {
            result *= -1;
        }

    }
    else if (rawHTML.includes("/") && !(rawHTML.includes("<") || rawHTML.includes(">"))) {
        let num1 = rawHTML.split("/")[0];
        let num2 = rawHTML.split("/")[1];
        result = num1 / num2;
        //console.log("before: " + result);
        result = result.toFixed(1);
        //console.log("after: " + result);
    }
    return result;
}

// returns the index of a random element in elements (except if that index is in excludes)
function getRandomElementIndex(elements, excludes=[]) {
    let i = -1;
    while (i == -1) {
        i = Math.floor(Math.random() * elements.length);
        for (let j = 0; j < excludes.length; j++) {
            if (i == excludes[j]) {
                i = -1;
            }
        }
    }
    return i;
}

// get a random number not already in elements
// supplement is used to add or subtract values before the random number is added or subtracted
function getRandomNumberNotInElements(elements, range, supplement, operator=null) {
    let n = supplement[0];
    while (n == supplement[0]) {
        for (let i = 1; i < supplement.length; i++) {
            
            if (operator != null) {
                switch(operator) {
                    case "+":
                        n += supplement[i];
                        break;
                    case "-":
                        n -= supplement[i];
                        break;
                }
            }
            else {
                n += supplement[i];
            }
        }

        let rand = Math.round(Math.random() * range);
        if (operator != "x") {
            if (Math.random() >= 0.5) {
                n += rand;
            }
            else {
                n -= rand;
            }
        }
        
        if (elements.includes(n)) {
            n = supplement[0];
        }
    }
    return n;
}

function getLabelsAndInputs() {
    let labelsAndInputs = [];
    let tableData = document.getElementsByTagName("td");
    
    let ptr = 0;
    for (let k = 0; k < tableData.length - 1; k+=2) {
        labelsAndInputs[ptr] = [tableData[k].children[0], tableData[k+1].children[0]];
        ptr += 1;
    }
    //console.log(labelsAndInputs);
    return labelsAndInputs;
}

function randomizeQuestions() {
    // this function will generate new questions on page load
    // first get all question divs
    // then set the h2 to be some math problem
    // then set the labels to be possible answers
    // ensure one label is the correct answer
    // ensure labels are assigned to the correct inputs
    let questions = document.getElementsByClassName("question");

    let operators = ['+', '-', 'x', '/'];
    let trigFuncs = ['sin', 'cos', 'tan'];
    let probabilityTrig = 0.2; // 0.2
    let trigCommonValues = ['0', '1', '-1', 'inf', '1/2', '<math><msqrt><mi>3</mi></msqrt></math>/2',
        '<math><msqrt><mi>2</mi></msqrt></math>/2', '-<math><msqrt><mi>2</mi></msqrt></math>/2',
        '<math><msqrt><mi>2</mi></msqrt></math>', '-<math><msqrt><mi>2</mi></msqrt></math>',
        '<math><msqrt><mi>3</mi></msqrt></math>', '-<math><msqrt><mi>3</mi></msqrt></math>',
        '-1/2', '-<math><msqrt><mi>3</mi></msqrt></math>/2'];
    let correctAnswer = null;
    let wrongAnswers = [];
    let mathProblem = null;

    console.log("length: " + questions.length);

    for (let i = 0; i < questions.length; i++) {

        if (1 - Math.random() <= probabilityTrig) {
            let func = trigFuncs[Math.floor(Math.random() * trigFuncs.length)];
            let degrees = 0;
            if (Math.random() >= 0.5) {
                degrees = Math.floor(Math.random() * 360 / 45) * 45;
            }
            else {
                degrees = Math.floor(Math.random() * 360 / 30) * 30;
            }

            let arg = degrees * TO_RAD;
            arg = arg.toFixed(2);
            let result = null;
            //console.log("func: " + func);
            //console.log("arg: " + arg);
            //console.log(func + "(" + degrees + ")");

            switch(func) {
                case 'sin':
                    result = Math.sin(arg).toFixed(1);
                    break;
                case 'cos':
                    result = Math.cos(arg).toFixed(1);
                    break;
                case 'tan':
                    result = Math.tan(arg).toFixed(1);
                    break;
            }
            //console.log(result);

            // convert result to formatted expression
            if (result > 1) {
                result = "inf";
            }

            for (let j = 0; j < trigCommonValues.length; j++) {
                let clean = parseFancyHTML(trigCommonValues[j]);
                let compare = trigCommonValues[j];
                if (clean != null) {
                    compare = clean;
                }

                if (Number(result) == Number(compare) || result == "inf" && compare == "inf") {
                    correctAnswer = trigCommonValues[j];
                    let wrong1 = getRandomElementIndex(trigCommonValues, [j,])
                    let wrong2 = getRandomElementIndex(trigCommonValues, [j, wrong1]);
                    wrongAnswers = [trigCommonValues[wrong1], trigCommonValues[wrong2]];
                    mathProblem = func + "(" + degrees + ")";
                    //console.log("unprocessed: " + correctAnswer);
                    //console.log("wrong: " + wrongAnswers);
                    break;
                }
            }

            if (correctAnswer == null) {
                console.log("no match for " + func + " " + arg + " = " + result);
            }
        }
        else {
            // do arith
            let operator = operators[Math.floor(Math.random() * operators.length)];
            let num1 = null;
            let num2 = null;
            let arithWrongAnswerRandom = 5;

            switch(operator) {
                case '+':
                    num1 = Math.round(Math.random() * 100);
                    num2 = Math.round(Math.random() * 100);
                    correctAnswer = num1 + num2;

                    // function ensures random value is unique ie not already in wrongAnswers or same as correctAnswer
                    wrongAnswers[0] = getRandomNumberNotInElements([wrongAnswers[0], wrongAnswers[1], correctAnswer], arithWrongAnswerRandom, [num1, num2], "+");
                    wrongAnswers[1] = getRandomNumberNotInElements([wrongAnswers[0], wrongAnswers[1], correctAnswer], arithWrongAnswerRandom, [num1, num2], "+");

                    
                    break;
                case '-':
                    num1 = Math.round(Math.random() * 100);
                    num2 = Math.round(Math.random() * 100);

                    correctAnswer = num1 - num2;
                    wrongAnswers[0] = getRandomNumberNotInElements([wrongAnswers[0], wrongAnswers[1], correctAnswer], arithWrongAnswerRandom, [num1, num2], "-");
                    wrongAnswers[1] = getRandomNumberNotInElements([wrongAnswers[0], wrongAnswers[1], correctAnswer], arithWrongAnswerRandom, [num1, num2], "-");

                    
                    break;
                case 'x':
                    num1 = Math.round(Math.random() * 20);
                    num2 = Math.round(Math.random() * 20);
                    correctAnswer = num1 * num2;

                    // keep looping this until all possible answers are unique
                    do {
                        if (Math.random() >= 0.5) {
                            wrongAnswers[0] = num1 * (num2 + Math.round(Math.random() * arithWrongAnswerRandom - 2))
                            wrongAnswers[1] = (num1 - Math.round(Math.random() * 3)) * num2
                        }
                        else {
                            wrongAnswers[0] = (num1 - Math.round(Math.random() * 3)) * num2
                            wrongAnswers[1] = num1 * (num2 + Math.round(Math.random() * arithWrongAnswerRandom - 2));
                        }
                    } while(wrongAnswers[0] == wrongAnswers[1] && wrongAnswers[0] == correctAnswer || wrongAnswers[1] == correctAnswer)
                    
                    break;
                case '/':
                    // make sure we don't make it too hard
                    // ensure num1 is divisible by an integer (ie not prime)
                    // so we do an integer multiplication and then work backwards
                    num1 = Math.round(Math.random() * 20) + 2;
                    num2 = Math.round(Math.random() * 100) + 2;
                    let mult = (num1 * num2);
                    num2 = num1
                    num1 = mult;

                    correctAnswer = num1 / num2;

                    let newNum2 = null;
                    // keep looping this until all possible answers are unique
                    do {
                        if (Math.random() >= 0.5) {
                            newNum2 = num2 + Math.round(Math.random() * 3);
                            wrongAnswers[0] = correctAnswer - newNum2;

                            newNum2 = num2 - Math.round(Math.random() * 3);
                            wrongAnswers[1] = correctAnswer + newNum2;
                        }
                        else {
                            newNum2 = num2 - Math.round(Math.random() * 3);
                            wrongAnswers[0] = correctAnswer + newNum2;

                            newNum2 = num2 + Math.round(Math.random() * 3);
                            wrongAnswers[1] = correctAnswer - newNum2;
                        }
                    } while (wrongAnswers[0] == wrongAnswers[1] && wrongAnswers[0] == correctAnswer || wrongAnswers[1] == correctAnswer)
                    
                    break;
                default:
                    console.log("error: unknown operator");
            }
            // optionally display the answer at the end of the problem, for debugging
            //mathProblem = num1 + " " + operator + " " + num2 + " = " + correctAnswer;
            mathProblem = num1 + " " + operator + " " + num2;
        }

        // now update h2, labels and clear inputs
        // just set innerHTML of labels
        // get children
        // assuming they are in order of HTML
        let children = questions[i].children;

        let labelsAndInputs = getLabelsAndInputs();
        
        let correctAnswerInserted = false;
        let ptr = 0;

        // change the labels and reset the inputs

        if (labelsAndInputs.length > 0) {
            for (let j = 0; j <= 2; j++) {
                let idx = j + (i * 3);
                if (labelsAndInputs[idx][0].tagName == "LABEL") {
                    if (correctAnswerInserted == false && Math.random() > 0.8 || ptr == 2) {
                        labelsAndInputs[idx][0].innerHTML = correctAnswer;
                        correctAnswerInserted = true;
                    }
                    else { 
                        labelsAndInputs[idx][0].innerHTML = wrongAnswers[ptr];
                        ptr += 1;
                    }
                }
                if (labelsAndInputs[idx][1].tagName == "INPUT") {
                    // reset inputs
                    labelsAndInputs[idx][1].checked = false;
                }
            }
        }
        
        // set the h2 to display the new math problem
        for (let j = 0; j < children.length; j++) {
            if (children[j].tagName == "H2") {
                children[j].innerHTML = mathProblem;
            }
        }
    }
    // reset result label
    document.getElementById("resultLabel").innerHTML = "Finished?";
}