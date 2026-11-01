// Observation only: recognize text actually rendered by a native WebGL game.
import Foundation
import Vision
import ImageIO
let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { fatalError("Cannot read frame") }
let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
if CommandLine.arguments.contains("--counter") { request.regionOfInterest = CGRect(x: 0.5, y: 0.7, width: 0.28, height: 0.2) }
request.usesLanguageCorrection = false
request.minimumTextHeight = 0.004
request.recognitionLanguages = ["en-US", "sv-SE"]
try VNImageRequestHandler(cgImage: image).perform([request])
let lines = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
let data = try JSONSerialization.data(withJSONObject: lines)
print(String(data: data, encoding: .utf8)!)
