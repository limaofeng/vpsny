require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name             = 'RNTHREADS'
  s.version          = package['version']
  s.summary          = 'Spawn new react native JavaScript processes for CPU intensive work outside of your main UI JavaScript process.'
  s.license          = package['license']
  s.homepage         = 'https://github.com/joltup/react-native-threads'
  s.authors          = 'Horcrux Chen'
  s.source           = { :git => 'https://github.com/joltup/react-native-threads.git', :tag => s.version }
  s.source_files     = 'ios/**/*.{h,m}'
  s.requires_arc     = true
  s.platforms        = { :ios => "8.0", :tvos => "9.2" }
  s.dependency         'React'
end