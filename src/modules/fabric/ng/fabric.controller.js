export class FabricController {
  static getDI() {
    return [];
  }
}

FabricController.$inject = FabricController.getDI();
FabricController.$$ngIsClass = true;