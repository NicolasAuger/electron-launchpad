// ============================================
// MAPPING CORRECT DU LAUNCHPAD MK2
// ============================================

export default class LaunchpadMK2 {
  
  // Convertir une note MIDI en coordonnées (x, y)
  static noteToXY(note) {
    // La grille principale 8x8
    // Les notes vont de 11 à 88
    // Structure : chaque ligne commence à X1 et va jusqu'à X8
    // Ligne 1 (y=0): 11, 12, 13, 14, 15, 16, 17, 18
    // Ligne 2 (y=1): 21, 22, 23, 24, 25, 26, 27, 28
    // Ligne 3 (y=2): 31, 32, 33, 34, 35, 36, 37, 38
    // etc.
    
    if (note >= 11 && note <= 88) {
      const row = Math.floor(note / 10) - 1; // ligne (y)
      const col = (note % 10) - 1;            // colonne (x)
      
      // Vérifier que c'est dans la grille valide
      if (col >= 0 && col <= 7 && row >= 0 && row <= 7) {
        return {
          x: col,
          y: row,
          type: 'grid',
          note: note
        };
      }
    }
    
    // Boutons du haut (round buttons - "scene launch")
    // Notes: 89, 79, 69, 59, 49, 39, 29, 19
    const topButtons = [89, 79, 69, 59, 49, 39, 29, 19];
    const topIndex = topButtons.indexOf(note);
    if (topIndex !== -1) {
      return {
        x: topIndex,
        y: -1, // Au-dessus de la grille
        type: 'top',
        note: note
      };
    }
    
    // Boutons de droite (round buttons)
    // Notes: 19, 29, 39, 49, 59, 69, 79, 89 (à droite de chaque ligne)
    const rightButtons = [19, 29, 39, 49, 59, 69, 79, 89];
    const rightIndex = rightButtons.indexOf(note);
    if (rightIndex !== -1) {
      return {
        x: 8, // À droite de la grille
        y: rightIndex,
        type: 'right',
        note: note
      };
    }
    
    return null;
  }
  
  // Convertir des coordonnées (x, y) en note MIDI
  static xyToNote(x, y) {
    // Grille principale 8x8
    if (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
      return (y + 1) * 10 + (x + 1);
    }
    
    // Boutons du haut
    if (y === -1 && x >= 0 && x <= 7) {
      const topButtons = [89, 79, 69, 59, 49, 39, 29, 19];
      return topButtons[x];
    }
    
    // Boutons de droite
    if (x === 8 && y >= 0 && y <= 7) {
      return (y + 1) * 10 + 9;
    }
    
    return null;
  }
  
  // Afficher la grille de notes pour comprendre
  static displayNoteGrid() {
    console.log('\n=== LAUNCHPAD MK2 - GRILLE DES NOTES ===\n');
    
    // Boutons du haut
    console.log('Boutons du haut (rond):');
    console.log('  89   79   69   59   49   39   29   19');
    console.log('  ↓    ↓    ↓    ↓    ↓    ↓    ↓    ↓');
    
    // Grille principale
    console.log('\nGrille principale 8x8:');
    for (let y = 0; y < 8; y++) {
      let row = '';
      for (let x = 0; x < 8; x++) {
        const note = this.xyToNote(x, y);
        row += `  ${note}`;
      }
      // Bouton de droite
      const rightNote = (y + 1) * 10 + 9;
      row += `  → ${rightNote}`;
      console.log(row);
    }
    
    console.log('\n');
  }
  
  // Décoder un message MIDI complet
  static decodeMIDI(message) {
    const [status, note, velocity] = message;
    
    const statusName = status === 144 ? 'Note On' : 
                       status === 128 ? 'Note Off' : 
                       status === 176 ? 'Control Change' : 
                       'Unknown';
    
    const action = velocity > 0 ? 'PRESSED' : 'RELEASED';
    const position = this.noteToXY(note);
    
    return {
      status: statusName,
      statusByte: status,
      note: note,
      velocity: velocity,
      action: action,
      position: position,
      raw: message
    };
  }
}
