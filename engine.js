/* DrywallMath engine - honest drywall math. UMD: browser global + Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DrywallMath = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var up = function (x) { return Math.ceil(x - 1e-9); };

  var SHEET = { '4x8': 32, '4x12': 48 };

  // Big openings (doors, windows) come out; the 10% waste goes back on.
  function netSqFt(grossSqFt, openingsSqFt) {
    return Math.max(0, grossSqFt - (openingsSqFt || 0));
  }

  function sheets(sqft, sheetSize) {
    var per = SHEET[sheetSize] || 32;
    return up(netSqFt(sqft, 0) * 1.10 / per);
  }

  // Screws: about a pound per 500 sq ft of board (roughly one screw per foot on 16" centers).
  function screwLbs(sqft) { return up(netSqFt(sqft, 0) / 500); }

  // Tape: ~0.37 linear ft of seam per sq ft of board; rolls are 500 ft.
  function tapeRolls(sqft) { return up(netSqFt(sqft, 0) * 0.37 / 500); }

  // Joint compound: three honest coats run about a 4.5-gal bucket per 450 sq ft.
  function mudBuckets(sqft) { return up(netSqFt(sqft, 0) / 450); }

  // Corner bead in 8-ft sticks, outside corners only.
  function beadSticks(cornerFt) { return up((cornerFt || 0) / 8); }

  function estimate(opts) {
    var sqft = netSqFt(opts.grossSqFt, opts.openingsSqFt);
    var size = opts.sheetSize || '4x8';
    var sh = sheets(sqft, size);
    var sc = screwLbs(sqft);
    var tr = tapeRolls(sqft);
    var mb = mudBuckets(sqft);
    var bs = beadSticks(opts.cornerFt);
    var sheetPrice = opts.sheetPrice != null ? opts.sheetPrice : 14;
    var cost = Math.round((sh * sheetPrice + sc * 9 + tr * 8 + mb * 18 + bs * 7) * 100) / 100;
    return {
      netSqFt: sqft, sheets: sh, sheetSize: size,
      screwLbs: sc, tapeRolls: tr, mudBuckets: mb, beadSticks: bs, total: cost
    };
  }

  function advice(est) {
    if (est.netSqFt >= 800 && est.sheetSize === '4x8') {
      return 'At this size, 4x12 sheets cut a quarter of your seams - and every seam is three coats of mud. They need two people and a straight stairwell; if you have both, switch sizes above.';
    }
    if (est.mudBuckets >= 3) {
      return 'Three-plus buckets means days of mud work: each coat needs a full dry day, so this job is a week of evenings, not a weekend. Budget the calendar, not just the cart.';
    }
    if (est.beadSticks > 0) {
      return 'Outside corners are where DIY jobs read as DIY - set bead square, mud it wide, and sand it twice. The hallway corner is what every guest touches.';
    }
    return 'Hang horizontal, stagger the seams, and buy the extra sheet now: the broken corner always happens on the last one, after the store closes.';
  }

  return {
    SHEET: SHEET, netSqFt: netSqFt, sheets: sheets, screwLbs: screwLbs,
    tapeRolls: tapeRolls, mudBuckets: mudBuckets, beadSticks: beadSticks,
    estimate: estimate, advice: advice
  };
});
