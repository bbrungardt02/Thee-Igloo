//
//  CustomVibration.swift
//  TheeIgloo
//
//  Created by Brandon Brungardt on 4/4/24.
//

import Foundation
import CoreHaptics

@objc(CustomVibration) class CustomVibration: NSObject { 
  private var hapticEngine: CHHapticEngine?

  override init() {
    super.init()
    do {
      hapticEngine = try CHHapticEngine()
    } catch let error {
      print("Error creating haptic engine: \(error.localizedDescription)")
    }
  }
  @objc static func requiresMainQueueSetup() -> Bool { return true }
  
  @objc(triggerVibration)
  func triggerVibration() -> Void {
      guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
          return
      }
      
      do {
           let pattern = try CHHapticPattern(events: [
        CHHapticEvent(eventType: .hapticTransient, parameters: [
            CHHapticEventParameter(parameterID: .hapticIntensity, value: 1),
            CHHapticEventParameter(parameterID: .hapticSharpness, value: 1)
        ], relativeTime: 0),
        CHHapticEvent(eventType: .hapticContinuous, parameters: [
            CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.5),
            CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)
        ], relativeTime: 0.1, duration: 1.0),
        CHHapticEvent(eventType: .hapticTransient, parameters: [
            CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.8),
            CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.8)
        ], relativeTime: 1.2)
    ], parameters: [])
          
          // Create a player to play the haptic pattern
          let patternPlayer = try hapticEngine?.makePlayer(with: pattern)
          
          // Start the haptic engine
          try hapticEngine?.start()
          
          // Start the pattern player
          try patternPlayer?.start(atTime: CHHapticTimeImmediate)
      } catch let error {
          print("Error playing haptic pattern: \(error.localizedDescription)")
      }
  }
}
