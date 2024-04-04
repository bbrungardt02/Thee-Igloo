//
//  CustomVibration.swift
//  TheeIgloo
//
//  Created by Brandon Brungardt on 4/4/24.
//

import Foundation
import CoreHaptics

@objc(CustomVibration) class CustomVibration: NSObject { private var hapticEngine: CHHapticEngine?
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
      print("Device does not support haptics")
      return
    }
    
  let pattern = [
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 0),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 0.3),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 0.6),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 0.9),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 1.2),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 1.5),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 1.8),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 2.1),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 2.4),
  CHHapticEvent(eventType: .hapticTransient, parameters: [], relativeTime: 2.7)
]
    
    do {
      let patternPlayer = try hapticEngine?.makePlayer(with: CHHapticPattern(events: pattern, parameters: []))
      try hapticEngine?.start()
      try patternPlayer?.start(atTime: CHHapticTimeImmediate)
    } catch let error {
      print("Error playing haptic pattern: \(error.localizedDescription)")
    }
  }
}
