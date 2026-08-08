#include <iostream>
#include <cmath>
#include "physics/earth.hpp"
#include "physics/satellite.hpp"


int main()
{
  constexpr double altitude = 500.0;
  double orbRad = Earth::radius + altitude;

  // Initial position
  Vec3 pos{orbRad, 0.0, 0.0};

  // Circular orbit velocity
  double orbVel = std::sqrt(Earth::mu / orbRad);
  Vec3 vel{0.0, orbVel, 0.0};

  Satellite satellite(pos, vel);
  double dt = 1.0; // 1 second

  for (int t = 0; t < 5700; ++t) {
    satellite.update(dt);
    double dist = satellite.pos.magnitude();
    double currAltitude = dist - Earth::radius;

    std::cout
      << "t = " << t
      << " s | position = ("
      << satellite.pos.x << ", "
      << satellite.pos.y << ", "
      << satellite.pos.z << ")"
      << " | distance = " << dist
      << " km | altitude = " << currAltitude
      << " km"
      << '\n';
  }

  return 0;
}