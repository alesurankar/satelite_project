cmake_minimum_required(VERSION 3.20)

project(SatelliteSimulation
  VERSION 0.1
  LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(Boost REQUIRED)

add_executable(satellite_sim
  src/main.cpp
  src/satellite.cpp
)

target_include_directories(satellite_sim PRIVATE
  include
)

target_link_libraries(satellite_sim PRIVATE
  Boost::boost
  ws2_32
)