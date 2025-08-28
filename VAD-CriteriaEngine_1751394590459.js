
export class VADCriteriaEngine {
  constructor() {
    // VAD therapeutic criteria based on Russell's Circumplex Model
    this.vadCriteria = {
      // Therapeutic quadrants based on Valence-Arousal space
      therapeuticQuadrants: {
        energizing: { valence: [0.6, 1.0], arousal: [0.6, 1.0], dominance: [0.5, 1.0] },
        calming: { valence: [0.6, 1.0], arousal: [0.0, 0.4], dominance: [0.3, 0.7] },
        melancholic: { valence: [0.0, 0.4], arousal: [0.0, 0.4], dominance: [0.0, 0.5] },
        tense: { valence: [0.0, 0.4], arousal: [0.6, 1.0], dominance: [0.0, 0.5] }
      },

      // Clinical VAD thresholds for different conditions
      clinicalThresholds: {
        anxiety: {
          target: { valence: 0.7, arousal: 0.3, dominance: 0.6 },
          avoid: { valence: [0.0, 0.3], arousal: [0.7, 1.0], dominance: [0.0, 0.3] }
        },
        depression: {
          target: { valence: 0.8, arousal: 0.6, dominance: 0.7 },
          avoid: { valence: [0.0, 0.4], arousal: [0.0, 0.3], dominance: [0.0, 0.4] }
        },
        adhd: {
          target: { valence: 0.6, arousal: 0.5, dominance: 0.8 },
          avoid: { valence: [0.8, 1.0], arousal: [0.8, 1.0], dominance: [0.0, 0.4] }
        },
        ptsd: {
          target: { valence: 0.7, arousal: 0.2, dominance: 0.8 },
          avoid: { valence: [0.0, 0.4], arousal: [0.6, 1.0], dominance: [0.0, 0.4] }
        }
      },

      // Treatment phase specific VAD criteria
      treatmentPhases: {
        'before treatment': {
          valence: [0.4, 0.8],
          arousal: [0.1, 0.5],
          dominance: [0.2, 0.7],
          description: 'Preparation, grounding, relaxation, and sleep support'
        },
        'after treatment': {
          valence: [0.5, 0.9],
          arousal: [0.3, 0.9],
          dominance: [0.4, 0.9],
          description: 'Integration, re-energizing, and empowerment'
        }
      }
    };
  }

  // Calculate VAD scores from audio features
  calculateVAD(audioFeatures) {
    const { 
      energy, 
      valence, 
      spectral_centroid, 
      spectral_bandwidth, 
      loudness, 
      tempo, 
      harmonic_ratio,
      zero_crossing_rate 
    } = audioFeatures;

    // Valence calculation (emotional positivity)
    let vadValence = valence || 0.5;
    if (spectral_centroid && spectral_centroid > 2000) vadValence += 0.1;
    if (harmonic_ratio && harmonic_ratio > 0.7) vadValence += 0.1;
    vadValence = Math.max(0, Math.min(1, vadValence));

    // Arousal calculation (energy/activation)
    let vadArousal = energy || 0.5;
    if (tempo && tempo > 120) vadArousal += 0.2;
    if (loudness && loudness > -10) vadArousal += 0.1;
    if (zero_crossing_rate && zero_crossing_rate > 0.15) vadArousal += 0.1;
    vadArousal = Math.max(0, Math.min(1, vadArousal));

    // Dominance calculation (control/power) - BPM-based
    let vadDominance = 0.3; // Base dominance
    
    // Primary dominance factor: BPM
    if (tempo) {
      if (tempo < 60) vadDominance = 0.1;        // Very low control/power
      else if (tempo < 80) vadDominance = 0.3;   // Low control
      else if (tempo < 100) vadDominance = 0.5;  // Moderate control
      else if (tempo < 120) vadDominance = 0.7;  // Good control
      else if (tempo < 140) vadDominance = 0.8;  // High control
      else vadDominance = 0.9;                   // Very high control/power
    }
    
    // Secondary factors (minor adjustments)
    if (harmonic_ratio && harmonic_ratio > 0.7) vadDominance += 0.05;
    if (loudness && loudness > -10) vadDominance += 0.05;
    
    vadDominance = Math.max(0, Math.min(1, vadDominance));

    return {
      valence: vadValence,
      arousal: vadArousal,
      dominance: vadDominance,
      quadrant: this.identifyQuadrant(vadValence, vadArousal, vadDominance)
    };
  }

  // Identify therapeutic quadrant
  identifyQuadrant(valence, arousal, dominance) {
    const quadrants = this.vadCriteria.therapeuticQuadrants;
    
    for (const [name, criteria] of Object.entries(quadrants)) {
      const [vMin, vMax] = criteria.valence;
      const [aMin, aMax] = criteria.arousal;
      const [dMin, dMax] = criteria.dominance;
      
      if (valence >= vMin && valence <= vMax &&
          arousal >= aMin && arousal <= aMax &&
          dominance >= dMin && dominance <= dMax) {
        return name;
      }
    }
    
    return 'neutral';
  }

  // Assess therapeutic suitability for a condition
  assessTherapeuticSuitability(vadScores, condition) {
    const criteria = this.vadCriteria.clinicalThresholds[condition.toLowerCase()];
    if (!criteria) return { suitable: false, reason: 'Unknown condition' };

    const { valence, arousal, dominance } = vadScores;
    const { target, avoid } = criteria;

    // Check if in avoid zone
    if (this.isInRange(valence, avoid.valence) ||
        this.isInRange(arousal, avoid.arousal) ||
        this.isInRange(dominance, avoid.dominance)) {
      return { 
        suitable: false, 
        reason: 'In contraindicated VAD range',
        recommendation: 'Avoid for this condition'
      };
    }

    // Calculate distance from target
    const distance = Math.sqrt(
      Math.pow(valence - target.valence, 2) +
      Math.pow(arousal - target.arousal, 2) +
      Math.pow(dominance - target.dominance, 2)
    );

    const suitabilityScore = Math.max(0, 1 - distance);
    
    return {
      suitable: suitabilityScore > 0.6,
      score: suitabilityScore,
      distance: distance,
      recommendation: this.generateRecommendation(suitabilityScore, condition)
    };
  }

  // Check if value is in range
  isInRange(value, range) {
    if (Array.isArray(range)) {
      return value >= range[0] && value <= range[1];
    }
    return false;
  }

  // Generate therapeutic recommendation
  generateRecommendation(score, condition) {
    if (score > 0.8) return `Highly recommended for ${condition} treatment`;
    if (score > 0.6) return `Suitable for ${condition} treatment`;
    if (score > 0.4) return `Use with caution for ${condition}`;
    return `Not recommended for ${condition} treatment`;
  }

  // Assess treatment phase appropriateness
  assessTreatmentPhase(vadScores, phase) {
    const criteria = this.vadCriteria.treatmentPhases[phase];
    if (!criteria) return { appropriate: false, reason: 'Unknown phase' };

    const { valence, arousal, dominance } = vadScores;
    const [vMin, vMax] = criteria.valence;
    const [aMin, aMax] = criteria.arousal;
    const [dMin, dMax] = criteria.dominance;

    const appropriate = 
      valence >= vMin && valence <= vMax &&
      arousal >= aMin && arousal <= aMax &&
      dominance >= dMin && dominance <= dMax;

    return {
      appropriate,
      phase,
      description: criteria.description,
      vadFit: {
        valence: valence >= vMin && valence <= vMax,
        arousal: arousal >= aMin && arousal <= aMax,
        dominance: dominance >= dMin && dominance <= dMax
      }
    };
  }

  // Generate comprehensive VAD report
  generateVADReport(track) {
    const vadScores = this.calculateVAD(track);
    
    return {
      trackId: track.id,
      title: track.title,
      vadScores,
      therapeuticProfile: {
        quadrant: vadScores.quadrant,
        treatmentPhase: this.assessTreatmentPhase(vadScores, track.treatmentPhase),
        clinicalSuitability: track.psychiatricRelevance?.map(relevance => ({
          condition: relevance.condition,
          assessment: this.assessTherapeuticSuitability(vadScores, relevance.condition)
        })) || [],
        recommendations: this.generateDetailedRecommendations(vadScores)
      }
    };
  }

  // Generate detailed recommendations
  generateDetailedRecommendations(vadScores) {
    const { valence, arousal, dominance, quadrant } = vadScores;
    const recommendations = [];

    // Quadrant-based recommendations
    switch (quadrant) {
      case 'energizing':
        recommendations.push('Suitable for motivation and activation');
        recommendations.push('Good for morning sessions or pre-activity');
        break;
      case 'calming':
        recommendations.push('Excellent for relaxation and stress reduction');
        recommendations.push('Ideal for evening sessions or post-treatment');
        break;
      case 'melancholic':
        recommendations.push('May help with emotional processing');
        recommendations.push('Use carefully with depressed clients');
        break;
      case 'tense':
        recommendations.push('Avoid with anxiety disorders');
        recommendations.push('May be useful for controlled exposure');
        break;
    }

    // VAD-specific recommendations
    if (valence < 0.3) recommendations.push('Low valence - monitor for mood effects');
    if (arousal > 0.8) recommendations.push('High arousal - may overstimulate');
    if (dominance < 0.3) recommendations.push('Low dominance - may increase feelings of powerlessness');

    return recommendations;
  }
}
