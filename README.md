# BudgetTracker

![BudgetTracker Screenshot](/screenshot.png)

## Overview

BudgetTracker is a lightweight, privacy-focused personal finance application built to replace spreadsheet-based budget tracking with a modern web interface. The application allows users to set monthly budgets, track expenses, and monitor their financial progress in a clean, intuitive dashboard. Amounts can be shown in South African Rand, Euro or New Zealand Dollar.

## Features

- **Monthly budgets, by year**: Each month of each year has its own budget; step between months or jump to any month
- **Expenses and extra income**: Add, edit, group and tick off expenses as they're paid; add one-off income such as freelance work
- **At-a-glance summary**: What's remaining, and a meter of paid vs still-to-pay against your income
- **Groups**: Organise expenses into collapsible groups, and move items between them
- **Copy and clear months**: Start a month from last month's budget, or clear a month in one go (with confirmation and undo)
- **Backup and restore**: Download your data as a file and restore it on any device, with a reminder when a backup is overdue
- **Privacy-Focused**: All data stored locally in your browser (localStorage)
- **Responsive Design**: Works on desktop and mobile, with full keyboard support
- **Light/Dark Mode**: Toggle between light and dark themes

## Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, with [Lucide](https://lucide.dev) icons
- **Testing**: Vitest
- **Storage**: Browser localStorage
- **Hosting**: Custom subdomain (budget.andresmit.co.za)

## Getting Started

### Prerequisites

- Node.js 22.12 or newer (24 recommended; CI uses 24)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/iiSmitty/budget-tracker.git
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

4. Run the tests
   ```bash
   npm test
   ```

5. Build for production
   ```bash
   npm run build
   # or
   yarn build
   ```

## Usage

1. Set your monthly income
2. Add your planned expenses, optionally in groups, and tick them off as you pay them
3. Keep an eye on what's remaining in the summary
4. At the start of a new month, copy last month's budget and adjust it
5. Back up regularly from Settings, since your data only lives in this browser

## Privacy

BudgetTracker respects your financial privacy:
- All data is stored locally in your browser using localStorage
- No financial information is transmitted to any server
- No tracking or analytics are implemented

## Deployment

The application is deployed at [budget.andresmit.co.za](https://budget.andresmit.co.za) as a subdomain of the main portfolio site. Every push to `main` is linted, tested, built and published to GitHub Pages.

## Future Enhancements

- Monthly reports and trends across months
- Recurring expenses that carry into each new month
- Installable app (PWA) for offline use on phones
- Optional cloud sync with end-to-end encryption

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*"Financial clarity by design"*