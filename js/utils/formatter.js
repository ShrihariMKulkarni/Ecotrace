/* ═══════════════════════════════════════════════════════════
   EcoTrace — Formatter Utility
   Number, date, and display formatting helpers
   ═══════════════════════════════════════════════════════════ */

const Formatter = (() => {
  
  function co2(kg, decimals = 1) {
    if (kg >= 1000) {
      return (kg / 1000).toFixed(decimals) + ' tonnes';
    }
    return kg.toFixed(decimals) + ' kg';
  }

  function co2Short(kg) {
    if (kg >= 1000) {
      return (kg / 1000).toFixed(1) + 't';
    }
    return kg.toFixed(1) + 'kg';
  }

  function co2Value(kg) {
    if (kg >= 1000) {
      return (kg / 1000).toFixed(1);
    }
    return kg.toFixed(1);
  }

  function co2Unit(kg) {
    return kg >= 1000 ? 'tonnes CO₂/yr' : 'kg CO₂';
  }

  function number(n, decimals = 0) {
    return n.toLocaleString('en-IN', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  }

  function percent(value, total) {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good night';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }

  function dateShort(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  }

  function dateFull(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  function timeShort(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  }

  function dateKey(date) {
    const d = date ? new Date(date) : new Date();
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  function relativeDay(dateStr) {
    const today = dateKey();
    const yesterday = dateKey(new Date(Date.now() - 86400000));
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return dateShort(dateStr);
  }

  function daysAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'today';
    if (diff === 1) return 'yesterday';
    return diff + ' days ago';
  }

  // Fun equivalencies
  function equivalency(kgCO2) {
    const equivalencies = [
      { threshold: 0.5, text: (kg) => `driving ${(kg / 0.21).toFixed(0)} km in a car` },
      { threshold: 2, text: (kg) => `charging ${(kg / 0.006).toFixed(0)} smartphones` },
      { threshold: 5, text: (kg) => `${(kg / 22).toFixed(1)} trees absorbing CO₂ for a year` },
      { threshold: 15, text: (kg) => `taking ${(kg / 4.6).toFixed(0)} cars off the road for a day` },
      { threshold: 50, text: (kg) => `planting ${(kg / 22).toFixed(0)} trees` },
      { threshold: 200, text: (kg) => `${(kg / 125).toFixed(1)} domestic flights saved` },
      { threshold: 1000, text: (kg) => `${(kg / 900).toFixed(1)} round trips Delhi → Mumbai by flight` },
      { threshold: Infinity, text: (kg) => `${(kg / 1900).toFixed(1)}× the average Indian's annual footprint` },
    ];
    
    const match = equivalencies.find(e => kgCO2 < e.threshold);
    return match ? match.text(kgCO2) : equivalencies[equivalencies.length - 1].text(kgCO2);
  }

  function treeEquiv(kgCO2) {
    return Math.max(1, Math.round(kgCO2 / 22));
  }

  return {
    co2, co2Short, co2Value, co2Unit, number, percent,
    greeting, dateShort, dateFull, timeShort, dateKey, relativeDay, daysAgo,
    equivalency, treeEquiv
  };
})();
