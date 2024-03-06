/* Constants used*/
export const FUX_CONST = {
  SYSTEM_VARIANTS: {
    FU_CLASSIC: 0,
    FU_V2: 1,
    ACTION_TALES: 2,
    NEON_CITY_OVERDRIVE: 3,
    EARTHDAWN_AGE_OF_LEGEND: 4
  }
};


export function SystemVariantName(isystemvariant) {
  let systemvariantname = 'Unknown Variant';
  switch (isystemvariant.toString()) {
    case FUX_CONST.SYSTEM_VARIANTS.FU_CLASSIC.toString():
      systemvariantname = game.i18n.localize('fux-dice-roller.settings.SYSTEM_VARIANT_FU_CLASSIC');
      break;
    case FUX_CONST.SYSTEM_VARIANTS.FU_V2.toString():
      systemvariantname = game.i18n.localize('fux-dice-roller.settings.SYSTEM_VARIANT_FU_V2');
      break;
    case FUX_CONST.SYSTEM_VARIANTS.ACTION_TALES.toString():
      systemvariantname = game.i18n.localize('fux-dice-roller.settings.SYSTEM_VARIANT_ACTION_TALES');
      break;
    case FUX_CONST.SYSTEM_VARIANTS.NEON_CITY_OVERDRIVE.toString():
      systemvariantname = game.i18n.localize('fux-dice-roller.settings.SYSTEM_VARIANT_NEON_CITY_OVERDRIVE');
      break;
    case FUX_CONST.SYSTEM_VARIANTS.EARTHDAWN_AGE_OF_LEGEND.toString():
      systemvariantname = game.i18n.localize('fux-dice-roller.settings.SYSTEM_VARIANT_EARTHDAWN_AGE_OF_LEGEND');
      break;
  }
  return systemvariantname;
}

