{ pkgs, ... }:
{
  projectRootFile = "flake.nix";

  programs.rustfmt.enable = true;
  programs.prettier.enable = true;
}
