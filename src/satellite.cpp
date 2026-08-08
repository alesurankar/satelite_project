#include "physics/satellite.hpp"
#include "physics/earth.hpp"
#include <cmath>


Satellite::Satellite(Vector3 position, Vector3 velocity)
  : 
  position(position), 
  velocity(velocity)
{}

void Satellite::update(double deltaTime)
{
  Vector3 oldAcceleration = calculateAcceleration();
  position = position + velocity * deltaTime + oldAcceleration * (0.5 * deltaTime * deltaTime);
  Vector3 newAcceleration = calculateAcceleration();
  velocity = velocity + (oldAcceleration + newAcceleration) * (0.5 * deltaTime);
}

Vector3 Satellite::calculateAcceleration() const
{
  double distance = position.magnitude();
  return position * (-Earth::mu / std::pow(distance, 3));
}
