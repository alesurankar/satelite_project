#pragma once
#include "math/vector.hpp"


class Satellite
{
public:
  Satellite(Vector3 position, Vector3 velocity);
  void update(double deltaTime);
private:
    Vector3 calculateAcceleration() const;
public:
  Vector3 position;
  Vector3 velocity;
};
