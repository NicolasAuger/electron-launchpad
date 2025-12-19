const midi = require('@julusian/midi');

class LaunchpadController {
  constructor() {
    this.input = new midi.Input();
    this.output = new midi.Output();
    this.inputPort = -1;
    this.outputPort = -1;
  }

  // Lister tous les ports disponibles
  listPorts() {
    console.log('\n=== Ports MIDI Input disponibles ===');
    for (let i = 0; i < this.input.getPortCount(); i++) {
      console.log(`${i}: ${this.input.getPortName(i)}`);
    }

    console.log('\n=== Ports MIDI Output disponibles ===');
    for (let i = 0; i < this.output.getPortCount(); i++) {
      console.log(`${i}: ${this.output.getPortName(i)}`);
    }
  }

  // Trouver et connecter le Launchpad
  connect() {
    // Chercher le Launchpad dans les ports disponibles
    for (let i = 0; i < this.input.getPortCount(); i++) {
      const name = this.input.getPortName(i);
      if (name.toLowerCase().includes('launchpad')) {
        this.inputPort = i;
        console.log(`✓ Launchpad Input trouvé: ${name}`);
        break;
      }
    }

    for (let i = 0; i < this.output.getPortCount(); i++) {
      const name = this.output.getPortName(i);
      if (name.toLowerCase().includes('launchpad')) {
        this.outputPort = i;
        console.log(`✓ Launchpad Output trouvé: ${name}`);
        break;
      }
    }

    if (this.inputPort === -1 || this.outputPort === -1) {
      throw new Error('Launchpad non trouvé. Assurez-vous qu\'il est branché.');
    }

    // Ouvrir les connexions
    this.input.openPort(this.inputPort);
    this.output.openPort(this.outputPort);

    console.log('✓ Launchpad connecté avec succès!\n');
    return this;
  }

  // Écouter les événements du Launchpad
  onButton(callback) {
    this.input.on('message', (deltaTime, message) => {
      const [status, note, velocity] = message;
      
      // 144 = Note On, 128 = Note Off
      if (status === 144 || status === 128) {
        const x = note % 16;
        const y = Math.floor(note / 16);
        const pressed = velocity > 0;
        
        callback({
          x,
          y,
          note,
          pressed,
          velocity,
          raw: message
        });
      }
    });

    return this;
  }

  // Allumer une LED
  setLED(x, y, color) {
    const note = y * 16 + x;
    this.output.sendMessage([144, note, color]);
    return this;
  }

  // Éteindre une LED
  clearLED(x, y) {
    return this.setLED(x, y, 0);
  }

  // Éteindre toutes les LEDs
  clearAll() {
    // Reset message pour Launchpad
    this.output.sendMessage([176, 0, 0]);
    return this;
  }

  // Couleurs prédéfinies pour Launchpad MK2
  static get colors() {
    return {
      OFF: 0,
      RED_LOW: 13,
      RED: 15,
      AMBER_LOW: 29,
      AMBER: 63,
      YELLOW: 62,
      GREEN_LOW: 28,
      GREEN: 60,
      LIME: 124,
      MINT: 120,
      CYAN: 90,
      BLUE: 79,
      PURPLE: 81,
      PINK: 95,
      MAGENTA: 53,
      ORANGE: 84,
      WHITE: 3
    };
  }

  // Fermer la connexion
  disconnect() {
    if (this.inputPort !== -1) {
      this.input.closePort();
    }
    if (this.outputPort !== -1) {
      this.output.closePort();
    }
    console.log('✓ Launchpad déconnecté');
  }
}

module.exports = LaunchpadController;