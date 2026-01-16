// Decimal place value names (right side of decimal point)
const placeValueNames = [
    'tenths', 'hundredths', 'thousandths', 'ten-thousandths',
    'hundred-thousandths', 'millionths', 'ten-millionths', 'hundred-millionths',
    'billionths', 'ten-billionths', 'hundred-billionths', 'trillionths'
];

// Integer place value names (left side of decimal point)
const integerPlaceValueNames = [
    'ones', 'tens', 'hundreds', 'thousands',
    'ten-thousands', 'hundred-thousands', 'millions', 'ten-millions',
    'hundred-millions', 'billions', 'ten-billions', 'hundred-billions'
];

// Get place value name (e.g., 1 = tenths, 2 = hundredths)
function getPlaceValueName(index) {
    if (index < placeValueNames.length) {
        return placeValueNames[index];
    }
    // For very large place values, generate the name
    const power = index + 1;
    if (power === 13) return 'ten-trillionths';
    if (power === 14) return 'hundred-trillionths';
    // Generic fallback
    const suffix = ['th', 'st', 'nd', 'rd'][power % 10] || 'th';
    return `${getPowerName(power)}ths`;
}

function getPowerName(power) {
    const powers = {
        1: 'ten', 2: 'hundred', 3: 'thousand', 4: 'ten-thousand',
        5: 'hundred-thousand', 6: 'million', 7: 'ten-million',
        8: 'hundred-million', 9: 'billion', 10: 'ten-billion',
        11: 'hundred-billion', 12: 'trillion'
    };
    return powers[power] || `10^${power}`;
}

// Get integer place value name (e.g., 0 = ones, 1 = tens, 2 = hundreds)
function getIntegerPlaceValueName(index) {
    if (index < integerPlaceValueNames.length) {
        return integerPlaceValueNames[index];
    }
    // For very large place values, generate the name
    const power = index;
    return `${getPowerName(power + 1)}s` || `10^${power}`;
}

// Get integer place value power (e.g., ones = 10^0, tens = 10^1, hundreds = 10^2)
function getIntegerPlaceValuePower(index) {
    return Math.pow(10, index);
}

// Parse decimal input and extract decimal portion
function parseDecimal(input) {
    // Remove any whitespace
    input = input.trim();
    
    // Check if it's a valid decimal number
    if (!input || input === '.') {
        return { valid: false, decimalPart: '', integerPart: '0' };
    }

    // Handle numbers with or without leading zero
    if (input.startsWith('.')) {
        input = '0' + input;
    }

    // Extract integer and decimal parts
    const parts = input.split('.');
    
    if (parts.length > 2) {
        return { valid: false, decimalPart: '', integerPart: '0' };
    }

    const integerPart = parts[0] || '0';
    const decimalPart = parts[1] || '';

    // Validate: should only contain digits
    const validPattern = /^-?\d+$/;
    if (!validPattern.test(integerPart) || (decimalPart && !/^\d+$/.test(decimalPart))) {
        return { valid: false, decimalPart: '', integerPart: '0' };
    }

    return {
        valid: true,
        decimalPart: decimalPart,
        integerPart: integerPart
    };
}

// Get place value power (e.g., tenths = 10^1, hundredths = 10^2)
function getPlaceValuePower(index) {
    return Math.pow(10, index + 1);
}

// Convert digit to fraction
function digitToFraction(digit, placeIndex) {
    const denominator = getPlaceValuePower(placeIndex);
    return {
        numerator: digit,
        denominator: denominator,
        simplified: simplifyFraction(digit, denominator)
    };
}

// Simplify fraction (basic GCD)
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(numerator, denominator) {
    if (numerator === 0) return { numerator: 0, denominator: 1 };
    const divisor = gcd(Math.abs(numerator), denominator);
    return {
        numerator: numerator / divisor,
        denominator: denominator / divisor
    };
}

// Generate decimal place value boxes (right side)
function generatePlaceValueBoxes(maxPlaces = 8) {
    const container = document.getElementById('place-value-container');
    container.innerHTML = '';

    for (let i = 0; i < maxPlaces; i++) {
        const box = document.createElement('div');
        box.className = 'place-value-box';
        box.dataset.placeIndex = i;

        const digitSpan = document.createElement('span');
        digitSpan.className = 'place-value-digit';
        digitSpan.textContent = '';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'place-value-label';
        const power = i + 1;
        labelSpan.innerHTML = `1/${getPlaceValuePower(i)} <span class="power-notation">(${getPowerNotation(-power)})</span>`;
        
        // Add click handler for highlighting
        box.addEventListener('click', () => {
            highlightPlaceValue('decimal', i);
        });

        const nameSpan = document.createElement('span');
        nameSpan.className = 'place-value-name';
        nameSpan.textContent = getPlaceValueName(i);

        box.appendChild(digitSpan);
        box.appendChild(labelSpan);
        box.appendChild(nameSpan);
        container.appendChild(box);
    }
}

// Generate integer place value boxes (left side)
function generateIntegerPlaceValueBoxes(maxPlaces = 8) {
    const container = document.getElementById('integer-place-value-container');
    container.innerHTML = '';

    for (let i = 0; i < maxPlaces; i++) {
        const box = document.createElement('div');
        box.className = 'place-value-box';
        box.dataset.placeIndex = i;

        const digitSpan = document.createElement('span');
        digitSpan.className = 'place-value-digit';
        digitSpan.textContent = '';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'place-value-label';
        labelSpan.innerHTML = `${getIntegerPlaceValuePower(i)} <span class="power-notation">(${getPowerNotation(i)})</span>`;
        
        // Add click handler for highlighting
        box.addEventListener('click', () => {
            highlightPlaceValue('integer', i);
        });

        const nameSpan = document.createElement('span');
        nameSpan.className = 'place-value-name';
        nameSpan.textContent = getIntegerPlaceValueName(i);

        box.appendChild(digitSpan);
        box.appendChild(labelSpan);
        box.appendChild(nameSpan);
        container.appendChild(box);
    }
}

// Update decimal place values with animation (right side)
async function updatePlaceValues(decimalPart, animate = true) {
    const container = document.getElementById('place-value-container');
    const boxes = container.querySelectorAll('.place-value-box');
    
    // Reset all boxes
    boxes.forEach((box, index) => {
        const digitSpan = box.querySelector('.place-value-digit');
        const digit = index < decimalPart.length ? decimalPart[index] : '';
        
        // Remove previous animation classes
        box.classList.remove('active', 'animating', 'highlight');
        digitSpan.classList.remove('entering');
        
        if (digit) {
            digitSpan.textContent = digit;
            if (animate) {
                // Animate this box
                box.classList.add('animating');
                digitSpan.classList.add('entering');
                
                // Add active class after animation starts
                setTimeout(() => {
                    box.classList.add('active');
                }, 50);
            } else {
                box.classList.add('active');
            }
        } else {
            digitSpan.textContent = '';
        }
    });

    // Add highlight animation to active boxes
    if (animate) {
        await new Promise(resolve => setTimeout(resolve, 100));
        boxes.forEach((box, index) => {
            if (index < decimalPart.length && decimalPart[index]) {
                setTimeout(() => {
                    box.classList.add('highlight');
                    setTimeout(() => {
                        box.classList.remove('highlight');
                    }, 1000);
                }, index * 100);
            }
        });
    }
}

// Update integer place values with animation (left side)
async function updateIntegerPlaceValues(integerPart, animate = true) {
    const container = document.getElementById('integer-place-value-container');
    const boxes = container.querySelectorAll('.place-value-box');
    
    // Reverse the integer part to match right-to-left order
    const reversedInteger = integerPart.split('').reverse().join('');
    
    // Reset all boxes
    boxes.forEach((box, index) => {
        const digitSpan = box.querySelector('.place-value-digit');
        const digit = index < reversedInteger.length ? reversedInteger[index] : '';
        
        // Remove previous animation classes
        box.classList.remove('active', 'animating', 'highlight');
        digitSpan.classList.remove('entering');
        
        if (digit) {
            digitSpan.textContent = digit;
            if (animate) {
                // Animate this box
                box.classList.add('animating');
                digitSpan.classList.add('entering');
                
                // Add active class after animation starts
                setTimeout(() => {
                    box.classList.add('active');
                }, 50);
            } else {
                box.classList.add('active');
            }
        } else {
            digitSpan.textContent = '';
        }
    });

    // Add highlight animation to active boxes
    if (animate) {
        await new Promise(resolve => setTimeout(resolve, 100));
        boxes.forEach((box, index) => {
            if (index < reversedInteger.length && reversedInteger[index]) {
                setTimeout(() => {
                    box.classList.add('highlight');
                    setTimeout(() => {
                        box.classList.remove('highlight');
                    }, 1000);
                }, index * 100);
            }
        });
    }
}

// Generate fractional breakdown with animation
async function updateFractionBreakdown(decimalPart, animate = true) {
    const container = document.getElementById('fraction-container');
    container.innerHTML = '';

    if (!decimalPart) {
        container.innerHTML = '<div class="empty-state">Enter a decimal number to see its fractional breakdown</div>';
        return;
    }

    const fractionItems = [];

    for (let i = 0; i < decimalPart.length; i++) {
        const digit = parseInt(decimalPart[i]);
        if (digit === 0) continue; // Skip zero digits

        const fraction = digitToFraction(digit, i);
        
        const item = document.createElement('div');
        item.className = 'fraction-item';
        if (!animate) {
            item.classList.add('visible');
        }

        const digitSpan = document.createElement('span');
        digitSpan.className = 'fraction-digit';
        digitSpan.textContent = digit;

        const separator = document.createElement('span');
        separator.className = 'fraction-separator';
        separator.textContent = '/';

        const denominator = document.createElement('span');
        denominator.className = 'fraction-denominator';
        denominator.textContent = fraction.denominator;

        const equals = document.createElement('span');
        equals.className = 'fraction-equals';
        equals.textContent = `= ${fraction.numerator}/${fraction.denominator}`;

        item.appendChild(digitSpan);
        item.appendChild(separator);
        item.appendChild(denominator);
        item.appendChild(equals);
        
        container.appendChild(item);
        fractionItems.push({ item, delay: i * 150 });
    }

    if (fractionItems.length === 0) {
        container.innerHTML = '<div class="empty-state">All digits are zero</div>';
        return;
    }

    // Animate fractions appearing
    if (animate) {
        for (const { item, delay } of fractionItems) {
            setTimeout(() => {
                item.classList.add('animating', 'visible');
            }, delay);
        }
    }
}

// Generate expanded form (both integer and decimal parts)
async function updateExpandedForm(integerPart, decimalPart, animate = true) {
    const container = document.getElementById('expanded-form');
    
    if (!integerPart && !decimalPart) {
        container.innerHTML = '<div class="empty-state">Enter a number to see its expanded form</div>';
        container.classList.remove('animating');
        return;
    }

    const terms = [];
    let termIndex = 0;

    // Add integer terms (left side)
    if (integerPart && integerPart !== '0') {
        const reversedInteger = integerPart.split('').reverse();
        for (let i = 0; i < reversedInteger.length; i++) {
            const digit = parseInt(reversedInteger[i]);
            if (digit === 0) continue;

            const power = getIntegerPlaceValuePower(i);
            terms.push({
                value: digit * power,
                display: `${digit} × ${power}`,
                type: 'integer',
                index: termIndex++
            });
        }
    }

    // Add decimal terms (right side)
    if (decimalPart) {
        for (let i = 0; i < decimalPart.length; i++) {
            const digit = parseInt(decimalPart[i]);
            if (digit === 0) continue;

            const fraction = digitToFraction(digit, i);
            terms.push({
                numerator: fraction.numerator,
                denominator: fraction.denominator,
                display: `${fraction.numerator}/${fraction.denominator}`,
                type: 'decimal',
                index: termIndex++
            });
        }
    }

    if (terms.length === 0) {
        container.innerHTML = '<div class="empty-state">0 = 0</div>';
        container.classList.remove('animating');
        return;
    }

    // Build HTML with animation-ready elements
    container.innerHTML = '';
    container.classList.add('animating');

    terms.forEach((term, idx) => {
        const termSpan = document.createElement('span');
        termSpan.className = 'expanded-term';
        if (!animate) {
            termSpan.classList.add('entering');
        }

        if (term.type === 'integer') {
            // Integer term: digit × power
            const digit = document.createElement('span');
            digit.textContent = term.display.split(' × ')[0];
            
            const times = document.createElement('span');
            times.textContent = ' × ';
            
            const power = document.createElement('span');
            power.textContent = term.display.split(' × ')[1];

            termSpan.appendChild(digit);
            termSpan.appendChild(times);
            termSpan.appendChild(power);
        } else {
            // Decimal term: fraction
            const numerator = document.createElement('span');
            numerator.textContent = term.numerator;

            const separator = document.createElement('span');
            separator.textContent = '/';

            const denominator = document.createElement('span');
            denominator.textContent = term.denominator;

            termSpan.appendChild(numerator);
            termSpan.appendChild(separator);
            termSpan.appendChild(denominator);
        }

        container.appendChild(termSpan);

        if (idx < terms.length - 1) {
            const plus = document.createElement('span');
            plus.className = 'expanded-plus';
            plus.textContent = ' + ';
            container.appendChild(plus);
        }

        // Animate term entry
        if (animate) {
            setTimeout(() => {
                termSpan.classList.add('entering');
            }, idx * 100);
        }
    });
}

// Main update function
async function updateVisualization(input, animate = true) {
    const parsed = parseDecimal(input);
    
    if (!parsed.valid) {
        // Clear everything
        updateIntegerPlaceValues('', false);
        updatePlaceValues('', false);
        updateFractionBreakdown('', false);
        updateExpandedForm('', '', false);
        return;
    }

    // Update all sections
    await updateIntegerPlaceValues(parsed.integerPart || '0', animate);
    await updatePlaceValues(parsed.decimalPart || '', animate);
    await updateFractionBreakdown(parsed.decimalPart || '', animate);
    await updateExpandedForm(parsed.integerPart || '0', parsed.decimalPart || '', animate);
}

// Auto-demo mode
let demoInterval = null;
let demoExamples = [
    '123.456',
    '9876.54321',
    '1000.5',
    '42.125',
    '3.14159',
    '12.34',
    '999.999',
    '1.234567',
    '100.01',
    '50.25',
    '1234.5678',
    '0.123'
];
let currentDemoIndex = 0;

function startDemo() {
    const demoBtn = document.getElementById('demo-btn');
    const input = document.getElementById('decimal-input');
    
    if (demoInterval) {
        // Stop demo
        clearInterval(demoInterval);
        demoInterval = null;
        demoBtn.textContent = '🎬 Auto Demo';
        demoBtn.classList.remove('active');
        return;
    }

    // Start demo
    demoBtn.textContent = '⏸ Stop Demo';
    demoBtn.classList.add('active');
    currentDemoIndex = 0;

    // Show first example immediately
    input.value = demoExamples[currentDemoIndex];
    updateVisualizationEnhanced(demoExamples[currentDemoIndex], true);

    // Cycle through examples
    demoInterval = setInterval(() => {
        currentDemoIndex = (currentDemoIndex + 1) % demoExamples.length;
        input.value = demoExamples[currentDemoIndex];
        updateVisualizationEnhanced(demoExamples[currentDemoIndex], true);
    }, 3000); // Change every 3 seconds
}

// Old initialization removed - using enhanced version below

// ==================== NEW FEATURES ====================

// Global state
let currentMode = 'normal';
let showScientificNotation = false;
let history = JSON.parse(localStorage.getItem('placeValueHistory')) || [];
let selectedHighlight = null;
let currentStep = 0;
let quizScore = 0;
let currentQuizNumber = null;

// Format large numbers with commas
function formatNumber(num) {
    const numStr = num.toString();
    if (!numStr.includes('.')) {
        return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

// Convert to scientific notation
function toScientificNotation(num) {
    if (num === 0) return '0 × 10⁰';
    const numStr = num.toString();
    if (!numStr.includes('.')) {
        const exp = numStr.length - 1;
        const mantissa = (parseFloat(numStr) / Math.pow(10, exp)).toFixed(10).replace(/\.?0+$/, '');
        return `${mantissa} × 10${getSuperscript(exp)}`;
    }
    const parts = numStr.split('.');
    if (parts[0] !== '0') {
        const exp = parts[0].length - 1;
        const mantissa = parseFloat(numStr) / Math.pow(10, exp);
        return `${mantissa.toFixed(10).replace(/\.?0+$/, '')} × 10${getSuperscript(exp)}`;
    } else {
        const firstNonZero = parts[1].search(/[1-9]/);
        const exp = -(firstNonZero + 1);
        const mantissa = parseFloat(numStr) * Math.pow(10, -exp);
        return `${mantissa.toFixed(10).replace(/\.?0+$/, '')} × 10${getSuperscript(exp)}`;
    }
}

function getSuperscript(num) {
    const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    const negative = num < 0;
    num = Math.abs(num);
    let result = negative ? '⁻' : '';
    num.toString().split('').forEach(d => result += superscripts[parseInt(d)]);
    return result;
}

// Get power notation for place values (10³, 10⁻², etc.)
function getPowerNotation(power) {
    if (power === 0) return '10⁰';
    if (power > 0) return `10${getSuperscript(power)}`;
    return `10${getSuperscript(power)}`;
}

// Add to history
function addToHistory(input, result) {
    if (input && input.trim()) {
        history.unshift({ input, result, timestamp: Date.now() });
        if (history.length > 10) history.pop();
        localStorage.setItem('placeValueHistory', JSON.stringify(history));
        updateHistoryDisplay();
    }
}

// Update history display
function updateHistoryDisplay() {
    const container = document.getElementById('history-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state">No history yet</div>';
        return;
    }
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = item.input;
        historyItem.addEventListener('click', () => {
            document.getElementById('decimal-input').value = item.input;
            updateVisualization(item.input, true);
        });
        container.appendChild(historyItem);
    });
}

// Calculate total from expanded form
function calculateTotal(integerPart, decimalPart) {
    let total = 0;
    
    // Add integer parts
    if (integerPart && integerPart !== '0') {
        total += parseFloat(integerPart) || 0;
    }
    
    // Add decimal parts
    if (decimalPart) {
        for (let i = 0; i < decimalPart.length; i++) {
            const digit = parseInt(decimalPart[i]);
            total += digit / getPlaceValuePower(i);
        }
    }
    
    return total;
}

// Update total calculation display
function updateTotalCalculation(integerPart, decimalPart, originalInput) {
    const container = document.getElementById('total-calculation');
    if (!container) return;
    
    if (!integerPart && !decimalPart) {
        container.innerHTML = '';
        return;
    }
    
    const total = calculateTotal(integerPart, decimalPart);
    const formattedInput = formatNumber(originalInput || `${integerPart || '0'}.${decimalPart || ''}`);
    const formattedTotal = formatNumber(total);
    
    container.innerHTML = `<div class="total-calculation-display">${formattedInput} = ${formattedTotal}</div>`;
}

// Update scientific notation display
function updateScientificNotationDisplay(integerPart, decimalPart) {
    const container = document.getElementById('scientific-notation');
    if (!container) return;
    
    if (!showScientificNotation) {
        container.style.display = 'none';
        return;
    }
    
    if (!integerPart && !decimalPart) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    
    const total = calculateTotal(integerPart, decimalPart);
    container.innerHTML = `<div class="scientific-display">Scientific Notation: ${toScientificNotation(total)}</div>`;
    container.style.display = 'block';
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// Copy expanded form to clipboard
async function copyExpandedForm() {
    const expandedForm = document.getElementById('expanded-form');
    const totalCalc = document.getElementById('total-calculation');
    
    let text = '';
    if (expandedForm.textContent) {
        text = expandedForm.textContent.trim();
    }
    if (totalCalc.textContent) {
        text += '\n' + totalCalc.textContent.trim();
    }
    
    if (text) {
        try {
            await navigator.clipboard.writeText(text);
            const copyBtn = document.getElementById('copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
}

// Quiz mode
function generateQuizQuestion() {
    const integerPlaces = Math.floor(Math.random() * 4) + 1; // 1-4 digits
    const decimalPlaces = Math.floor(Math.random() * 3) + 1; // 1-3 digits
    
    let integerPart = '';
    for (let i = 0; i < integerPlaces; i++) {
        integerPart += Math.floor(Math.random() * 10).toString();
    }
    
    let decimalPart = '';
    for (let i = 0; i < decimalPlaces; i++) {
        decimalPart += Math.floor(Math.random() * 10).toString();
    }
    
    const number = `${integerPart}.${decimalPart}`;
    currentQuizNumber = number;
    
    const placeValueIndex = Math.floor(Math.random() * (integerPlaces + decimalPlaces));
    const isInteger = placeValueIndex < integerPlaces;
    const actualIndex = isInteger ? (integerPlaces - 1 - placeValueIndex) : (placeValueIndex - integerPlaces);
    
    let question = `What is the digit in the `;
    if (isInteger) {
        question += getIntegerPlaceValueName(actualIndex) + ' place';
    } else {
        question += getPlaceValueName(actualIndex) + ' place';
    }
    question += ` of ${formatNumber(number)}?`;
    
    return { question, answer: isInteger ? parseInt(integerPart.split('').reverse()[actualIndex]) : parseInt(decimalPart[actualIndex]) };
}

// Step-by-step mode
let stepByStepTerms = [];
let stepByStepIndex = 0;

function initStepByStep(integerPart, decimalPart) {
    stepByStepTerms = [];
    stepByStepIndex = 0;
    
    // Add integer terms
    if (integerPart && integerPart !== '0') {
        const reversedInteger = integerPart.split('').reverse();
        for (let i = 0; i < reversedInteger.length; i++) {
            const digit = parseInt(reversedInteger[i]);
            if (digit !== 0) {
                const power = getIntegerPlaceValuePower(i);
                stepByStepTerms.push({
                    type: 'integer',
                    digit,
                    power,
                    value: digit * power,
                    placeValue: getIntegerPlaceValueName(i),
                    explanation: `${digit} in the ${getIntegerPlaceValueName(i)} place = ${digit} × ${power} = ${digit * power}`
                });
            }
        }
    }
    
    // Add decimal terms
    if (decimalPart) {
        for (let i = 0; i < decimalPart.length; i++) {
            const digit = parseInt(decimalPart[i]);
            if (digit !== 0) {
                const fraction = digitToFraction(digit, i);
                stepByStepTerms.push({
                    type: 'decimal',
                    digit,
                    numerator: fraction.numerator,
                    denominator: fraction.denominator,
                    value: digit / fraction.denominator,
                    placeValue: getPlaceValueName(i),
                    explanation: `${digit} in the ${getPlaceValueName(i)} place = ${fraction.numerator}/${fraction.denominator} = ${(digit / fraction.denominator).toFixed(10).replace(/\.?0+$/, '')}`
                });
            }
        }
    }
    
    updateStepByStepDisplay();
}

function updateStepByStepDisplay() {
    const container = document.getElementById('step-content');
    const currentSpan = document.getElementById('step-current');
    const totalSpan = document.getElementById('step-total');
    const stepPrevBtn = document.getElementById('step-prev');
    const stepNextBtn = document.getElementById('step-next');
    
    if (!container) return;
    
    totalSpan.textContent = stepByStepTerms.length || 1;
    
    if (stepByStepTerms.length === 0) {
        container.innerHTML = '<div class="empty-state">Enter a number to see step-by-step breakdown</div>';
        currentSpan.textContent = '0';
        stepPrevBtn.disabled = true;
        stepNextBtn.disabled = true;
        return;
    }
    
    currentSpan.textContent = stepByStepIndex + 1;
    stepPrevBtn.disabled = stepByStepIndex === 0;
    stepNextBtn.disabled = stepByStepIndex >= stepByStepTerms.length - 1;
    
    if (stepByStepIndex < stepByStepTerms.length) {
        const term = stepByStepTerms[stepByStepIndex];
        container.innerHTML = `<div class="step-explanation">${term.explanation}</div>`;
    }
}

// Comparison mode
function updateComparisonMode(num1, num2) {
    const comparisonView = document.getElementById('comparison-view');
    if (!comparisonView) return;
    
    if (currentMode !== 'comparison' || !num1 || !num2) {
        comparisonView.style.display = 'none';
        return;
    }
    
    comparisonView.style.display = 'block';
    
    const parsed1 = parseDecimal(num1);
    const parsed2 = parseDecimal(num2);
    
    // TODO: Display comparison visualization
    // This would show both numbers side by side with highlighted differences
}

// Update mode
function updateMode(mode) {
    currentMode = mode;
    
    // Update UI visibility
    document.getElementById('quiz-section').style.display = mode === 'quiz' ? 'block' : 'none';
    document.getElementById('step-by-step-section').style.display = mode === 'step-by-step' ? 'block' : 'none';
    document.getElementById('comparison-input-group').style.display = mode === 'comparison' ? 'block' : 'none';
    document.getElementById('comparison-view').style.display = mode === 'comparison' ? 'block' : 'none';
    
    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Initialize mode-specific features
    if (mode === 'quiz') {
        const quizQuestion = generateQuizQuestion();
        document.getElementById('quiz-question').textContent = quizQuestion.question;
        // Store answer for later checking
    }
}

// Click to highlight function
function highlightPlaceValue(type, index) {
    // Remove previous highlights
    document.querySelectorAll('.place-value-box').forEach(box => {
        box.classList.remove('clicked-highlight');
    });
    document.querySelectorAll('.expanded-term').forEach(term => {
        term.classList.remove('clicked-highlight');
    });
    
    // Highlight the clicked box
    if (type === 'integer') {
        const boxes = document.querySelectorAll('#integer-place-value-container .place-value-box');
        if (boxes[index]) {
            boxes[index].classList.add('clicked-highlight');
        }
    } else {
        const boxes = document.querySelectorAll('#place-value-container .place-value-box');
        if (boxes[index]) {
            boxes[index].classList.add('clicked-highlight');
        }
    }
    
    // Highlight corresponding terms in expanded form (would need to match term indices)
    // This is a simplified version - could be enhanced to match exactly
}

// Enhanced updateVisualization with all new features
async function updateVisualizationEnhanced(input, animate = true) {
    const parsed = parseDecimal(input);
    
    if (!parsed.valid) {
        updateIntegerPlaceValues('', false);
        updatePlaceValues('', false);
        updateFractionBreakdown('', false);
        updateExpandedForm('', '', false);
        updateTotalCalculation('', '', '');
        updateScientificNotationDisplay('', '');
        return;
    }
    
    // Update all sections
    await updateIntegerPlaceValues(parsed.integerPart || '0', animate);
    await updatePlaceValues(parsed.decimalPart || '', animate);
    await updateFractionBreakdown(parsed.decimalPart || '', animate);
    await updateExpandedForm(parsed.integerPart || '0', parsed.decimalPart || '', animate);
    updateTotalCalculation(parsed.integerPart || '0', parsed.decimalPart || '', input);
    updateScientificNotationDisplay(parsed.integerPart || '0', parsed.decimalPart || '');
    
    // Add to history
    addToHistory(input, calculateTotal(parsed.integerPart || '0', parsed.decimalPart || ''));
    
    // Initialize step-by-step if in that mode
    if (currentMode === 'step-by-step') {
        initStepByStep(parsed.integerPart || '0', parsed.decimalPart || '');
    }
    
    // Update comparison if in comparison mode
    if (currentMode === 'comparison') {
        const comparisonInput = document.getElementById('comparison-input');
        if (comparisonInput && comparisonInput.value) {
            updateComparisonMode(input, comparisonInput.value);
        }
    }
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', () => {
    // Generate initial place value boxes
    generateIntegerPlaceValueBoxes(8);
    generatePlaceValueBoxes(8);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').textContent = '☀️';
    }
    
    // Load history
    updateHistoryDisplay();
    
    // Setup event listeners
    const input = document.getElementById('decimal-input');
    let updateTimeout = null;
    
    input.addEventListener('input', (e) => {
        if (demoInterval) {
            clearInterval(demoInterval);
            demoInterval = null;
            const demoBtn = document.getElementById('demo-btn');
            demoBtn.textContent = '🎬 Auto Demo';
            demoBtn.classList.remove('active');
        }
        
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            updateVisualizationEnhanced(e.target.value, true);
        }, 150);
    });
    
    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => updateMode(btn.dataset.mode));
    });
    
    // Scientific notation toggle
    document.getElementById('scientific-toggle')?.addEventListener('click', () => {
        showScientificNotation = !showScientificNotation;
        const toggle = document.getElementById('scientific-toggle');
        toggle.classList.toggle('active', showScientificNotation);
        const input = document.getElementById('decimal-input');
        if (input.value) {
            const parsed = parseDecimal(input.value);
            updateScientificNotationDisplay(parsed.integerPart || '0', parsed.decimalPart || '');
        }
    });
    
    // Copy button
    document.getElementById('copy-btn')?.addEventListener('click', copyExpandedForm);
    
    // Clear history
    document.getElementById('clear-history')?.addEventListener('click', () => {
        history = [];
        localStorage.removeItem('placeValueHistory');
        updateHistoryDisplay();
    });
    
    // Step-by-step controls
    document.getElementById('step-prev')?.addEventListener('click', () => {
        if (stepByStepIndex > 0) {
            stepByStepIndex--;
            updateStepByStepDisplay();
        }
    });
    
    document.getElementById('step-next')?.addEventListener('click', () => {
        if (stepByStepIndex < stepByStepTerms.length - 1) {
            stepByStepIndex++;
            updateStepByStepDisplay();
        }
    });
    
    // Quiz controls
    document.getElementById('quiz-next')?.addEventListener('click', () => {
        const quizQuestion = generateQuizQuestion();
        document.getElementById('quiz-question').textContent = quizQuestion.question;
    });
    
    // Comparison input
    const comparisonInput = document.getElementById('comparison-input');
    if (comparisonInput) {
        comparisonInput.addEventListener('input', (e) => {
            if (currentMode === 'comparison') {
                updateComparisonMode(input.value, e.target.value);
            }
        });
    }
    
    // Demo button
    const demoBtn = document.getElementById('demo-btn');
    demoBtn?.addEventListener('click', startDemo);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        
        if (e.key === 'ArrowRight' && currentMode === 'step-by-step') {
            document.getElementById('step-next')?.click();
        } else if (e.key === 'ArrowLeft' && currentMode === 'step-by-step') {
            document.getElementById('step-prev')?.click();
        } else if (e.key === 'Enter' && currentMode === 'quiz') {
            document.getElementById('quiz-next')?.click();
        }
    });
    
    // Initial state
    updateVisualizationEnhanced('', false);
});

