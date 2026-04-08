class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0' || this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
             this.currentOperand = '0';
             return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0' && this.previousOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        // Map division and multiplication signs
        let opMap = {
            '÷': '÷',
            '×': '×',
            '+': '+',
            '-': '-'
        };
        this.operation = opMap[operation];
        
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    computation = 'Error';
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }
        
        // Handle precision issues loosely
        if (typeof computation === 'number') {
            computation = Math.round(computation * 1000000000) / 1000000000;
            this.currentOperand = computation.toString();
        } else {
            this.currentOperand = computation; // Error case
        }
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        if (number === 'Error') return number;
        const stringNumber = number.toString();
        if (stringNumber === '-') return '-';
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (stringNumber.startsWith('-') && integerDisplay === '0') {
             integerDisplay = '-0';
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
        
        // Trigger pop animation
        this.currentOperandTextElement.classList.remove('pop');
        void this.currentOperandTextElement.offsetWidth; // trigger reflow
        this.currentOperandTextElement.classList.add('pop');
    }
}

const numberButtons = document.querySelectorAll('[data-action="number"]');
const operationButtons = document.querySelectorAll('[data-action="operation"]');
const equalsButton = document.querySelector('[data-action="calculate"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const clearButton = document.querySelector('[data-action="clear"]');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Add ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    
    const circles = button.getElementsByClassName("ripple");
    if(circles.length > 0){
        circles[0].remove();
    }

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    
    const clientX = event.clientX || (event.touches ? event.touches[0].clientX : rect.left + radius);
    const clientY = event.clientY || (event.touches ? event.touches[0].clientY : rect.top + radius);

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${clientX - rect.left - radius}px`;
    circle.style.top = `${clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    button.appendChild(circle);
}

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousedown', createRipple);
    button.addEventListener('touchstart', createRipple, {passive: true});
});

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        if(calculator.currentOperand === 'Error') calculator.clear();
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        if(calculator.currentOperand === 'Error') calculator.clear();
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', () => {
    if(calculator.currentOperand === 'Error') {
        calculator.clear();
    } else {
        calculator.delete();
    }
    calculator.updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', function(event) {
    let key = event.key;
    if (key >= '0' && key <= '9' || key === '.') {
        if(calculator.currentOperand === 'Error') calculator.clear();
        calculator.appendNumber(key);
        calculator.updateDisplay();
    }
    if (key === '+' || key === '-' || key === '*' || key === '/') {
        if(calculator.currentOperand === 'Error') calculator.clear();
        let currentBtn = key === '*' ? '×' : key === '/' ? '÷' : key;
        calculator.chooseOperation(currentBtn);
        calculator.updateDisplay();
    }
    if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    if (key === 'Backspace') {
        if(calculator.currentOperand === 'Error') {
            calculator.clear();
        } else {
            calculator.delete();
        }
        calculator.updateDisplay();
    }
    if (key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
});
