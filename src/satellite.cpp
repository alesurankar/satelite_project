#include "physics/satellite.hpp"
#include "physics/earth.hpp"
#include <cmath>


Satellite::Satellite(Vec3 pos, Vec3 vel)
  : 
  pos(pos), 
  vel(vel)
{}

void Satellite::update(double dt)
{
  Vec3 oldAcclr = CalculateAcceleration();
  pos = pos + vel * dt + oldAcclr * (0.5 * dt * dt);
  Vec3 newAcclr = CalculateAcceleration();
  vel = vel + (oldAcclr + newAcclr) * (0.5 * dt);
}

Vec3 Satellite::CalculateAcceleration() const
{
  double dist = pos.magnitude();
  return pos * (-Earth::mu / std::pow(dist, 3));
}
