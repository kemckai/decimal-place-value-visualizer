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
        labelSpan.textContent = `1/${getPlaceValuePower(i)}`;

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
        labelSpan.textContent = `${getIntegerPlaceValuePower(i)}`;

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
    updateVisualization(demoExamples[currentDemoIndex], true);

    // Cycle through examples
    demoInterval = setInterval(() => {
        currentDemoIndex = (currentDemoIndex + 1) % demoExamples.length;
        input.value = demoExamples[currentDemoIndex];
        updateVisualization(demoExamples[currentDemoIndex], true);
    }, 3000); // Change every 3 seconds
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Generate initial place value boxes for both sides
    generateIntegerPlaceValueBoxes(8);
    generatePlaceValueBoxes(8);

    // Setup input event listener
    const input = document.getElementById('decimal-input');
    let updateTimeout = null;

    input.addEventListener('input', (e) => {
        // Stop demo if user types
        if (demoInterval) {
            clearInterval(demoInterval);
            demoInterval = null;
            const demoBtn = document.getElementById('demo-btn');
            demoBtn.textContent = '🎬 Auto Demo';
            demoBtn.classList.remove('active');
        }

        // Debounce updates for smoother typing
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            updateVisualization(e.target.value, true);
        }, 150);
    });

    // Setup demo button
    const demoBtn = document.getElementById('demo-btn');
    demoBtn.addEventListener('click', startDemo);

    // Initial empty state
    updateVisualization('', false);
});

