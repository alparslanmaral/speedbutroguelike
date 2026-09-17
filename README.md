# Inferno Speed

A roguelike twist on the classic two-player **Speed** card game. You race the Devil to empty your hand and stock before the ante timer burns out, earn chips, and buy synergistic jokers in the Soul Trader shop.

Open `index.html` in any modern browser. No build step, no dependencies.

## Loop

1. **Deck preview** — see the exact composition of your deck (extra copies, Gold/Diamond/Glass cards) before every ante.
2. **Ante** — play cards that are ±1 rank of a center pile's top card. Hand refills from your stock. Empty everything before the timer ends.
3. **Reward** — base chips + speed bonus (+ boss bonus).
4. **Shop** — 3 random offers, sell owned jokers for half price, reroll for 3 chips.
5. Every 3rd ante (and the final one) is a **Boss Ante** with a shorter timer and random rule restrictions.

## Controls

- Click a card to play it onto any valid pile, or click a pile first to aim.
- Keys `1`–`6` play the nth card in your hand. `Esc` clears the pile selection.

## Files

- `index.html` — screens and modals
- `style.css` — theme, CSS-drawn cards
- `script.js` — game rules, Devil AI, ante/boss loop, jokers, shop, persistence (localStorage)
