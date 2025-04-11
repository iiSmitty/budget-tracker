# BudgetTracker

![BudgetTracker Screenshot](/screenshot.png)

## Overview

BudgetTracker is a lightweight, privacy-focused personal finance application built to replace spreadsheet-based budget tracking with a modern web interface. The application allows users to set monthly budgets, track expenses, and monitor their financial progress in a clean, intuitive dashboard. The app is specifically designed for South African currency (ZAR/Rand).

## Features

- **Monthly Budget Management**: Set and track monthly budgets with ease
- **Expense Tracking**: Add and edit expenses
- **Financial Overview**: View total budget, income, and remaining funds at a glance
- **Budget Usage Visualization**: Visual representation of budget consumption
- **Privacy-Focused**: All data stored locally in your browser (localStorage)
- **Responsive Design**: Works on both desktop and mobile devices (best viewed on desktop currently)
- **Light/Dark Mode**: Toggle between light and dark themes

## Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Storage**: Browser localStorage
- **Hosting**: Custom subdomain (budget.andresmit.co.za)

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/budget-tracker.git
   cd budget-tracker
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Build for production
   ```bash
   npm run build
   # or
   yarn build
   ```

## Usage

1. Set your monthly income and budget
2. Add your expenses as they occur
3. View your remaining budget and spending patterns
4. Adjust your budget as needed for future months

## Privacy

BudgetTracker respects your financial privacy:
- All data is stored locally in your browser using localStorage
- No financial information is transmitted to any server
- No tracking or analytics are implemented

## Deployment

The application is deployed at [budget.andresmit.co.za](https://budget.andresmit.co.za) as a subdomain of the main portfolio site.

## Future Enhancements

- Expense categories and tagging
- Mobile optimization
- Multi-currency support (currently South African Rand only)
- Monthly reports and analytics
- Data export/import functionality
- Optional cloud sync with end-to-end encryption

## License

[MIT License](LICENSE)

## Contact

André Smit - [andresmit.co.za](https://andresmit.co.za)

---

*"Financial clarity by design"*