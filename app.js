// --- State Management ---
const GOALS = {
    calories: 2200,
    carbs: 250,
    protein: 150,
    fat: 70,
    water: 8
};

// Database per 100g
const FOOD_DATABASE = {
    "Chicken Breast": { calories: 165, carbs: 0, protein: 31, fat: 3.6 },
    "Salmon": { calories: 208, carbs: 0, protein: 20, fat: 13 },
    "Brown Rice": { calories: 111, carbs: 23, protein: 2.6, fat: 0.9 },
    "Broccoli": { calories: 34, carbs: 6.6, protein: 2.8, fat: 0.4 },
    "Avocado": { calories: 160, carbs: 8.5, protein: 2, fat: 14.7 },
    "Eggs": { calories: 155, carbs: 1.1, protein: 13, fat: 11 },
    "Oatmeal": { calories: 68, carbs: 12, protein: 2.4, fat: 1.4 },
    "Apple": { calories: 52, carbs: 14, protein: 0.3, fat: 0.2 },
    "Almonds": { calories: 579, carbs: 22, protein: 21, fat: 50 },
    "Cheeseburger": { calories: 303, carbs: 32, protein: 15, fat: 14 },
    "Pizza Slice": { calories: 285, carbs: 36, protein: 12, fat: 10 },
    "Ice Cream": { calories: 207, carbs: 24, protein: 3.5, fat: 11 }
};

let dailyTotals = { calories: 0, carbs: 0, protein: 0, fat: 0 };

let currentUser = JSON.parse(localStorage.getItem('vitality_user')) || null;
let meals = JSON.parse(localStorage.getItem('vitality_meals')) || [];
let waterIntake = parseInt(localStorage.getItem('vitality_water')) || 0;
let userBMI = JSON.parse(localStorage.getItem('vitality_bmi')) || null;

// --- DOM Elements ---
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authForm = document.getElementById('auth-form');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const nameGroup = document.getElementById('name-group');

const modal = document.getElementById('meal-modal');
const logMealBtns = document.querySelectorAll('.log-meal-btn-global');
const closeModalBtn = document.getElementById('close-modal');
const mealForm = document.getElementById('meal-form');
const fullMealListEl = document.getElementById('full-meal-list');
const miniMealListEl = document.getElementById('mini-meal-list');

const toastContainer = document.getElementById('toast-container');
const logoutBtn = document.getElementById('logout-btn');

const waterGlassesContainer = document.getElementById('water-glasses-container');
const addWaterBtn = document.getElementById('add-water-btn');
const waterCurrentEl = document.getElementById('water-current');
const dashWaterEl = document.getElementById('dash-water');
const dashCalsEl = document.getElementById('dash-cals');

const navLinks = document.querySelectorAll('.nav-links li');
const appViews = document.querySelectorAll('.app-view');

const bmiForm = document.getElementById('bmi-form');

// --- Initialization ---
let isSignupMode = false;

function init() {
    checkAuth();
}

function startApp() {
    document.getElementById('user-display-name').innerText = currentUser.name;
    document.getElementById('greeting-text').innerText = `Good Morning, ${currentUser.name.split(' ')[0]}`;
    
    calculateTotals();
    updateDashboardUI();
    renderWater();
    renderMealLists();
    updateOverallStatus();
    renderBMI();
    generateComprehensiveAIReport();
    
    switchView('view-dashboard');
}

// --- SPA Router ---
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        navLinks.forEach(n => n.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetView = e.currentTarget.getAttribute('data-target');
        switchView(targetView);
    });
});

function switchView(viewId) {
    appViews.forEach(view => {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
    });
    
    const activeView = document.getElementById(viewId);
    if(activeView) {
        activeView.classList.remove('hidden-view');
        activeView.classList.add('active-view');
        
        if (viewId === 'view-ai') {
            generateComprehensiveAIReport();
        }
    }
}

// --- Authentication Logic ---
function checkAuth() {
    if (currentUser) {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        startApp();
    } else {
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

tabLogin.addEventListener('click', () => {
    isSignupMode = false;
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    nameGroup.style.display = 'none';
    document.getElementById('auth-submit-btn').innerText = 'Login';
});

tabSignup.addEventListener('click', () => {
    isSignupMode = true;
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    nameGroup.style.display = 'block';
    document.getElementById('auth-submit-btn').innerText = 'Create Account';
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    
    if (isSignupMode) {
        const name = document.getElementById('auth-name').value || "User";
        currentUser = { name, email };
    } else {
        currentUser = { name: "Alex", email };
    }
    
    localStorage.setItem('vitality_user', JSON.stringify(currentUser));
    
    authContainer.classList.add('fade-out');
    setTimeout(() => {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        startApp();
        showToast('Welcome to Vitality!', 'fa-leaf');
    }, 500);
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('vitality_user');
    currentUser = null;
    appContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    authContainer.classList.remove('fade-out');
});

// --- Core Math & Dashboard ---
function calculateTotals() {
    dailyTotals = { calories: 0, carbs: 0, protein: 0, fat: 0 };
    meals.forEach(meal => {
        dailyTotals.calories += meal.calories;
        dailyTotals.carbs += meal.carbs;
        dailyTotals.protein += meal.protein;
        dailyTotals.fat += meal.fat;
    });
}

function updateDashboardUI() {
    dashCalsEl.innerText = dailyTotals.calories;
    dashWaterEl.innerText = waterIntake;
}

// --- BMI Calculator ---
bmiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const heightCm = parseFloat(document.getElementById('bmi-height').value);
    const weightKg = parseFloat(document.getElementById('bmi-weight').value);
    
    if(heightCm > 0 && weightKg > 0) {
        const heightM = heightCm / 100;
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);
        
        let category = '';
        let classColor = '';
        if (bmi < 18.5) { category = 'Underweight'; classColor = 'bmi-underweight'; }
        else if (bmi >= 18.5 && bmi <= 24.9) { category = 'Normal Weight'; classColor = 'bmi-normal'; }
        else if (bmi >= 25 && bmi <= 29.9) { category = 'Overweight'; classColor = 'bmi-overweight'; }
        else { category = 'Obese'; classColor = 'bmi-obese'; }
        
        userBMI = { value: bmi, category, classColor, heightCm, weightKg };
        localStorage.setItem('vitality_bmi', JSON.stringify(userBMI));
        
        renderBMI();
        showToast(`BMI Calculated: ${bmi} (${category})`, 'fa-weight-scale');
    }
});

function renderBMI() {
    const circle = document.getElementById('bmi-result-circle');
    const valEl = document.getElementById('bmi-value');
    const catEl = document.getElementById('bmi-category');
    
    if (userBMI) {
        valEl.innerText = userBMI.value;
        catEl.innerText = userBMI.category;
        
        circle.className = 'bmi-result-circle';
        circle.classList.add(userBMI.classColor);
        
        if (userBMI.category === 'Normal Weight') catEl.style.color = 'var(--status-good)';
        else if (userBMI.category === 'Underweight' || userBMI.category === 'Overweight') catEl.style.color = 'var(--status-warn)';
        else catEl.style.color = 'var(--status-bad)';
    }
}

// --- Health Evaluator & Meals ---
function evaluateHealth(meal) {
    const calPer100 = (meal.calories / meal.quantity) * 100;
    const proteinRatio = meal.protein / meal.calories;
    
    // Simple mock logic for Healthy/Moderate/Unhealthy
    if (calPer100 > 350 || meal.fat > 30) return "Unhealthy";
    if (calPer100 > 200 && proteinRatio < 0.05) return "Moderate";
    if (meal.protein > 10 || meal.calories < 150) return "Healthy";
    return "Moderate";
}

function getSmartSuggestion(healthStatus) {
    if(healthStatus === 'Healthy') return "Great choice! This supports your goals.";
    if(healthStatus === 'Moderate') return "Decent choice, but keep an eye on your portion sizes.";
    return "Consider balancing this with a high-protein or fibrous meal later.";
}

function renderMealLists() {
    fullMealListEl.innerHTML = '';
    miniMealListEl.innerHTML = '';
    
    if (meals.length === 0) {
        const emptyState = '<div class="empty-state" style="grid-column: 1/-1;">No meals logged yet.</div>';
        fullMealListEl.innerHTML = emptyState;
        miniMealListEl.innerHTML = emptyState;
        return;
    }
    
    const reversed = [...meals].reverse();
    
    reversed.forEach((meal, index) => {
        const healthLevel = meal.healthStatus;
        let badgeClass = 'badge-moderate';
        let icon = 'fa-circle-minus';
        
        if(healthLevel === 'Healthy') { badgeClass = 'badge-healthy'; icon = 'fa-leaf'; }
        if(healthLevel === 'Unhealthy') { badgeClass = 'badge-unhealthy'; icon = 'fa-burger'; }
        
        const badgeHTML = `<span class="badge ${badgeClass}"><i class="fa-solid ${icon}"></i> ${healthLevel}</span>`;
        
        // Full List
        const liFull = document.createElement('li');
        liFull.className = 'meal-item';
        liFull.innerHTML = `
            <div class="meal-info">
                <h4>${meal.name} <span style="font-size:0.8rem;color:gray;">(${meal.quantity}g)</span></h4>
                <span style="font-size: 0.8rem; color: var(--text-secondary);">${new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div><span class="meal-cals">${meal.calories} kcal</span></div>
            <div class="meal-macros">C: ${meal.carbs}g &bull; P: ${meal.protein}g &bull; F: ${meal.fat}g</div>
            <div>${badgeHTML}</div>
        `;
        fullMealListEl.appendChild(liFull);
        
        // Mini List (Dashboard - limit to 3)
        if(index < 3) {
            const liMini = document.createElement('li');
            liMini.className = 'meal-item';
            liMini.innerHTML = `
                <div class="meal-info">
                    <h4>${meal.name}</h4>
                </div>
                <div><span class="meal-cals" style="font-size: 1rem;">${meal.calories} kcal</span></div>
                <div>${badgeHTML}</div>
            `;
            miniMealListEl.appendChild(liMini);
        }
    });
}

// --- Water Tracker ---
function renderWater() {
    waterCurrentEl.innerText = waterIntake;
    waterGlassesContainer.innerHTML = '';
    
    for (let i = 0; i < GOALS.water; i++) {
        const glass = document.createElement('i');
        glass.className = 'fa-solid fa-glass-water water-glass';
        if (i < waterIntake) {
            glass.classList.add('filled');
        }
        waterGlassesContainer.appendChild(glass);
    }
}

addWaterBtn.addEventListener('click', () => {
    if (waterIntake < GOALS.water) {
        waterIntake++;
        localStorage.setItem('vitality_water', waterIntake);
        renderWater();
        updateOverallStatus();
        updateDashboardUI();
        showToast('Hydration updated!', 'fa-droplet');
    } else {
        showToast('You hit your daily water goal!', 'fa-trophy');
    }
});

// --- Overall Status ---
function updateOverallStatus() {
    let score = 0;

    meals.forEach(m => {
        if(m.healthStatus === 'Healthy') score += 1;
        if(m.healthStatus === 'Unhealthy') score -= 1;
    });
    
    if (waterIntake >= 4) score += 1;
    if (waterIntake >= 8) score += 1;
    if (dailyTotals.calories > GOALS.calories * 1.1) score -= 2;

    const statusTextEl = document.getElementById('overall-status-text');
    const statusIconEl = document.getElementById('status-icon');

    if (score >= 2) {
        statusTextEl.innerText = "Excellent";
        statusTextEl.style.color = "var(--status-good)";
        statusIconEl.innerHTML = '<i class="fa-solid fa-heart-circle-check"></i>';
        statusIconEl.style.color = "var(--status-good)";
        statusIconEl.style.background = "rgba(16, 185, 129, 0.2)";
        statusIconEl.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.4)";
    } else if (score >= 0) {
        statusTextEl.innerText = "Good";
        statusTextEl.style.color = "var(--primary-color)";
        statusIconEl.innerHTML = '<i class="fa-solid fa-heart-pulse"></i>';
        statusIconEl.style.color = "var(--primary-color)";
        statusIconEl.style.background = "rgba(0, 242, 254, 0.2)";
        statusIconEl.style.boxShadow = "0 0 15px rgba(0, 242, 254, 0.4)";
    } else {
        statusTextEl.innerText = "Needs Improvement";
        statusTextEl.style.color = "var(--status-bad)";
        statusIconEl.innerHTML = '<i class="fa-solid fa-heart-crack"></i>';
        statusIconEl.style.color = "var(--status-bad)";
        statusIconEl.style.background = "rgba(239, 68, 68, 0.2)";
        statusIconEl.style.boxShadow = "0 0 15px rgba(239, 68, 68, 0.4)";
    }
}

// --- Comprehensive AI Analysis ---
function generateComprehensiveAIReport() {
    const elImprove = document.getElementById('ai-improve');
    const elAvoid = document.getElementById('ai-avoid');
    const elTips = document.getElementById('ai-tips');
    
    let improveText = "";
    let avoidText = "";
    let tipsText = "";
    
    // Analyze Hydration
    if (waterIntake < 4) {
        improveText += "Your hydration is critically low. Drinking water is essential for your metabolism and energy. ";
    } else if (waterIntake < 8) {
        tipsText += "You are halfway to your hydration goal! Keep a water bottle nearby. ";
    } else {
        tipsText += "Excellent hydration today! You've hit your water goals. ";
    }
    
    // Analyze BMI
    if (userBMI) {
        if (userBMI.category === 'Underweight') {
            improveText += "Based on your BMI, consider increasing your calorie intake with nutrient-dense foods like nuts, avocados, and protein to build healthy mass. ";
        } else if (userBMI.category === 'Overweight' || userBMI.category === 'Obese') {
            avoidText += "Your BMI indicates a calorie surplus over time. Try to avoid highly processed carbs and saturated fats to establish a healthy caloric deficit. ";
        } else {
            tipsText += "Your BMI is in a perfectly healthy range. Keep maintaining your current balanced lifestyle! ";
        }
    } else {
        tipsText += "Calculate your BMI in the BMI tab to get more personalized metabolic insights. ";
    }
    
    // Analyze Meals
    let healthyCount = 0;
    let unhealthyCount = 0;
    meals.forEach(m => {
        if(m.healthStatus === 'Healthy') healthyCount++;
        if(m.healthStatus === 'Unhealthy') unhealthyCount++;
    });
    
    if (unhealthyCount > healthyCount) {
        avoidText += "You've logged more Unhealthy meals than Healthy ones today. Avoid foods high in trans fats and simple sugars to balance your diet. ";
        improveText += "Try to replace one unhealthy snack with a fruit or protein-based option. ";
    }
    
    if (dailyTotals.protein < 50 && meals.length > 0) {
        improveText += "Your protein intake is very low today. Add lean meats, eggs, or legumes to help with muscle repair and satiety. ";
    }
    
    if (dailyTotals.calories > GOALS.calories) {
        avoidText += "You have exceeded your daily calorie goal. Avoid late-night snacking to prevent further surplus. ";
    }
    
    // Fallbacks
    if(!improveText) improveText = "You're doing great! To improve further, ensure you get 8 hours of sleep and 30 minutes of activity.";
    if(!avoidText) avoidText = "You have no immediate red flags! Continue avoiding excessive sugar and highly processed items.";
    if(!tipsText) tipsText = "Consistency is key. Keep logging your meals and water daily to maintain this momentum.";
    
    elImprove.innerText = improveText;
    elAvoid.innerText = avoidText;
    elTips.innerText = tipsText;
}

document.getElementById('refresh-ai-btn').addEventListener('click', () => {
    generateComprehensiveAIReport();
    showToast('AI Analysis Refreshed', 'fa-rotate-right');
});

// --- Modal Event Listeners ---
logMealBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.add('active');
    });
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

mealForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('food-name').value;
    const quantity = parseInt(document.getElementById('food-quantity').value);
    const multiplier = quantity / 100;
    
    let baseData = FOOD_DATABASE[name];
    if (!baseData) {
        const hash = name.length;
        baseData = {
            calories: 100 + (hash * 10),
            carbs: 10 + hash,
            protein: 5 + (hash % 5),
            fat: 5 + (hash % 3)
        };
    }
    
    const newMeal = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        name: name,
        quantity: quantity,
        calories: Math.round(baseData.calories * multiplier),
        carbs: Math.round(baseData.carbs * multiplier),
        protein: Math.round(baseData.protein * multiplier),
        fat: Math.round(baseData.fat * multiplier)
    };
    
    newMeal.healthStatus = evaluateHealth(newMeal);
    
    meals.push(newMeal);
    localStorage.setItem('vitality_meals', JSON.stringify(meals));
    
    mealForm.reset();
    modal.classList.remove('active');
    
    const suggestion = getSmartSuggestion(newMeal.healthStatus);
    showToast(`Logged ${newMeal.name}! ${suggestion}`, 'fa-check-circle');
    
    calculateTotals();
    updateDashboardUI();
    renderMealLists();
    updateOverallStatus();
    generateComprehensiveAIReport();
    
    switchView('view-meals');
    navLinks.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-target="view-meals"]').classList.add('active');
});

function showToast(message, iconClass) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Run app
document.addEventListener('DOMContentLoaded', init);
