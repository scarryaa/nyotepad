{ pkgs ? import <nixpkgs> {} }:

let
  nixpkgs = import <nixpkgs> {};
  nodejs = nixpkgs.nodejs-18_x;
in
with nixpkgs;
stdenv.mkDerivation {
  name = "node-dev";
  buildInputs = [ nodejs go wails];
}
