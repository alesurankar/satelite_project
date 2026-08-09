#include <iostream>
#include <cmath>
#include <numbers>
#include "physics/earth.hpp"
#include "physics/satellite.hpp"


int main()
{
  constexpr double altitude = 500.0;

  const double orbRad = Earth::radius + altitude;

  // Initial position
  const Vec3 pos{orbRad, 0.0, 0.0};

  // Circular orbit velocity
  const double orbVel = std::sqrt(Earth::mu / orbRad);
  const Vec3 vel{0.0, orbVel, 0.0};

  Satellite satellite(pos, vel);

  constexpr double dt = 1.0; // seconds

  // Theoretical orbital period
  const double orbitalPeriod =
    2.0 * std::numbers::pi *
    std::sqrt(
      (orbRad * orbRad * orbRad) / Earth::mu
    );

  std::cout << "=== Orbit parameters ===\n";
  std::cout << "Earth radius:     " << Earth::radius << " km\n";
  std::cout << "Altitude:         " << altitude << " km\n";
  std::cout << "Orbital radius:   " << orbRad << " km\n";
  std::cout << "Orbital speed:    " << orbVel << " km/s\n";
  std::cout << "Orbital period:   " << orbitalPeriod << " s\n";
  std::cout << "Orbital period:   " << orbitalPeriod / 60.0 << " min\n";
  std::cout << '\n';

  const int simulationTime = static_cast<int>(std::ceil(orbitalPeriod));

  for (int t = 0; t < simulationTime; ++t)
  {
    satellite.update(dt);

    const double dist = satellite.pos.magnitude();
    const double currAltitude = dist - Earth::radius;
    const double speed = satellite.vel.magnitude();

    std::cout
      << "t = " << t
      << " s | position = ("
      << satellite.pos.x << ", "
      << satellite.pos.y << ", "
      << satellite.pos.z << ")"
      << " | speed = " << speed
      << " km/s"
      << " | altitude = " << currAltitude
      << " km"
      << '\n';
  }

  return 0;
}