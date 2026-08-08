#pragma once
#include "math/vec3.hpp"


class Satellite
{
public:
  Satellite(Vec3 pos, Vec3 vel);
  void update(double dt);
private:
    Vec3 CalculateAcceleration() const;
public:
  Vec3 pos;
  Vec3 vel;
};
