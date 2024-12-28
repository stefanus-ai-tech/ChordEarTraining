declare module 'pizzicato' {
  export interface PizzicatoStatic {
    context: AudioContext;
  }
  namespace Pizzicato {
    interface SoundOptions {
      source: 'wave';
      options: {
        type: 'sine' | 'square' | 'sawtooth' | 'triangle';
        frequency?: number;
        attack?: number;
        release?: number;
        volume?: number;
        // Add more customization options
        decay?: number;
        sustain?: number;
        pitch?: number;
        detune?: number;
        modulationFrequency?: number;
        modulationDepth?: number;
        pan?: number;
        harmonicity?: number;
        distortion?: number;
        fadeIn?: number;
        fadeOut?: number;
      };
    }

    interface Effect {
      connect(node: any): void;
      disconnect(): void;
    }

    interface LowPassFilterOptions {
      frequency: number;
      peak: number;
    }

    interface ReverbOptions {
      time: number;
      decay: number;
      mix: number;
    }

    class Effects {
      static LowPassFilter: new (options: LowPassFilterOptions) => Effect;
      static Reverb: new (options: ReverbOptions) => Effect;
    }

    class Sound {
      constructor(options: SoundOptions);
      addEffect(effect: Effect): void;
      play(): void;
      stop(): void;
      pause(): void;
      volume: number;
    }

    class Group {
      constructor(sounds: Sound[]);
      play(): void;
      stop(): void;
      pause(): void;
      volume: number;
    }
  }

  interface PizzicatoStatic {
    Sound: typeof Pizzicato.Sound;
    Group: typeof Pizzicato.Group;
    Effects: typeof Pizzicato.Effects;
  }

  const Pizzicato: PizzicatoStatic;
  export = Pizzicato;
}
