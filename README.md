# Inferno Speed

A single-player roguelike built on the **Speed** card game. Empty your hand and stock before the ante timer burns out, earn chips, and buy synergistic jokers in the Soul Trader shop.

Open `index.html` in any modern browser. No build step, no dependencies.

## Loop

1. **Deck preview** — see the exact composition of your deck (extra copies, Gold/Diamond/Glass cards) before every ante.
2. **Ante** — play cards that are ±1 rank of a center pile's top card. Your hand refills from your stock. Clear everything before the timer ends.
3. **Reward** — base chips + speed bonus (+ boss bonus).
4. **Shop** — 3 random offers, sell owned jokers for half price, reroll for 3 chips.
5. Every 3rd ante (and the final one) is a **Boss Ante** with a shorter timer and random rule restrictions.

## Controls

- Click a card to play it onto any valid pile, or click a pile first to aim.
- Keys `1`–`6` play the nth card in your hand. `Esc` clears the pile selection.
- `Space` (or the Flip button) flips new cards from the reserves when you are stuck. It also happens automatically after a short delay.

## Files

- `index.html` — screens and modals
- `style.css` — theme, CSS-drawn cards (placeholder until the pixel-art pass)
- `script.js` — rules, ante/boss loop, jokers, shop, persistence (localStorage)
