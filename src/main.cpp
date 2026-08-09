#include <cmath>
#include <iostream>
#include <numbers>
#include <thread>
#include <chrono>
#include <string>
#include <boost/asio.hpp>
#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include "physics/earth.hpp"
#include "physics/satellite.hpp"


namespace asio = boost::asio;
namespace beast = boost::beast;
namespace websocket = beast::websocket;

using tcp = asio::ip::tcp;

int main()
{
  // WebSocket server
  asio::io_context ioContext;
  tcp::acceptor acceptor(ioContext, tcp::endpoint(tcp::v4(), 9002));

  std::cout
    << "WebSocket server listening on "
    << "ws://localhost:9002\n";

  // Wait for Three.js/browser to connect
  tcp::socket socket(ioContext);
  acceptor.accept(socket);
  std::cout << "Client connected!\n";
  websocket::stream<tcp::socket> ws(
      std::move(socket)
  );

  ws.accept();
  std::cout << "WebSocket connection established!\n";

  // Satellite setup
  constexpr double altitude = 500.0;
  const double orbRad = Earth::radius + altitude;
  const Vec3 pos{orbRad, 0.0, 0.0};
  const double orbVel = std::sqrt(Earth::mu / orbRad);
  const Vec3 vel{0.0, orbVel, 0.0};

  Satellite satellite(pos, vel);
  constexpr double dt = 1.0;

  // Simulation
  const double orbitalPeriod =
    2.0 * std::numbers::pi *
    std::sqrt(
      (orbRad * orbRad * orbRad) /
      Earth::mu
    );

  const int simulationTime =
    static_cast<int>(
      std::ceil(orbitalPeriod)
    );

  std::cout << "\n=== Orbit parameters ===\n";
  std::cout << "Earth radius:     " << Earth::radius << " km\n";
  std::cout << "Altitude:         " << altitude << " km\n";
  std::cout << "Orbital radius:   " << orbRad << " km\n";
  std::cout << "Orbital speed:    " << orbVel << " km/s\n";
  std::cout << "Orbital period:   " << orbitalPeriod << " s\n";
  std::cout << '\n';

  // Simulation loop
  for (int t = 0; t < simulationTime; ++t)
  {
    satellite.update(dt);
    const double dist = satellite.pos.magnitude();
    const double currAltitude = dist - Earth::radius;
    const double speed = satellite.vel.magnitude();

    // Console output
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

    // JSON message
    std::string message =
      "{"
      "\"type\":\"satellite\","
      "\"id\":1,"
      "\"time\":" + std::to_string(t) + ","
      "\"position\":{"
        "\"x\":" + std::to_string(satellite.pos.x) + ","
        "\"y\":" + std::to_string(satellite.pos.y) + ","
        "\"z\":" + std::to_string(satellite.pos.z) +
      "},"
      "\"velocity\":{"
        "\"x\":" + std::to_string(satellite.vel.x) + ","
        "\"y\":" + std::to_string(satellite.vel.y) + ","
        "\"z\":" + std::to_string(satellite.vel.z) +
      "}"
      "}";

    // Send message to Three.js
    ws.write(
      asio::buffer(message)
    );

    // Wait one second
    std::this_thread::sleep_for(
      std::chrono::seconds(1)
    );
  }

  // Close WebSocket
  ws.close(
    websocket::close_code::normal
  );

  return 0;
}