#include <iostream>
#include <cmath>
#include "physics/earth.hpp"
#include "physics/satellite.hpp"


int main()
{
  constexpr double altitude = 500.0;
  double orbitRadius = Earth::radius + altitude;

  // Initial position
  Vector3 position{
    orbitRadius,
    0.0,
    0.0
  };

  // Circular orbit velocity
  double orbitalVelocity =
    std::sqrt(Earth::mu / orbitRadius);

  Vector3 velocity{
    0.0,
    orbitalVelocity,
    0.0
  };

  Satellite satellite(position, velocity);
  double deltaTime = 1.0; // 1 second

  for (int t = 0; t < 5700; ++t) {
    satellite.update(deltaTime);
    double distance = satellite.position.magnitude();
    double currentAltitude = distance - Earth::radius;

    std::cout
      << "t = " << t
      << " s | position = ("
      << satellite.position.x << ", "
      << satellite.position.y << ", "
      << satellite.position.z << ")"
      << " | distance = " << distance
      << " km | altitude = " << currentAltitude
      << " km"
      << '\n';
  }

  return 0;
}