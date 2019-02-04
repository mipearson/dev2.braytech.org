import Destiny2 from 'bungie-api-ts/destiny2';

interface ManifestEntries<T> {
  [key: string]: T;
}

interface ManifestItems {
  DestinyPlaceDefinition: ManifestEntries<Destiny2.DestinyPlaceDefinition>;
  DestinyActivityTypeDefinition: ManifestEntries<Destiny2.DestinyActivityTypeDefinition>;
  DestinyInventoryBucketDefinition: ManifestEntries<Destiny2.DestinyInventoryBucketDefinition>;
  DestinyRaceDefinition: ManifestEntries<Destiny2.DestinyRaceDefinition>;
  DestinyTalentGridDefinition: ManifestEntries<Destiny2.DestinyTalentGridDefinition>;
  DestinyActivityDefinition: ManifestEntries<Destiny2.DestinyActivityDefinition>;
  DestinyGenderDefinition: ManifestEntries<Destiny2.DestinyGenderDefinition>;
  DestinySandboxPerkDefinition: ManifestEntries<Destiny2.DestinySandboxPerkDefinition>;
  DestinyStatGroupDefinition: ManifestEntries<Destiny2.DestinyStatGroupDefinition>;
  DestinyFactionDefinition: ManifestEntries<Destiny2.DestinyFactionDefinition>;
  DestinyVendorGroupDefinition: ManifestEntries<Destiny2.DestinyVendorGroupDefinition>;
  DestinyRewardSourceDefinition: ManifestEntries<Destiny2.DestinyRewardSourceDefinition>;
  DestinyItemCategoryDefinition: ManifestEntries<Destiny2.DestinyItemCategoryDefinition>;
  DestinyDamageTypeDefinition: ManifestEntries<Destiny2.DestinyDamageTypeDefinition>;
  DestinyActivityModeDefinition: ManifestEntries<Destiny2.DestinyActivityModeDefinition>;
  DestinyActivityGraphDefinition: ManifestEntries<Destiny2.DestinyActivityGraphDefinition>;
  DestinyUnlockDefinition: ManifestEntries<Destiny2.DestinyUnlockDefinition>;
  DestinyClassDefinition: ManifestEntries<Destiny2.DestinyClassDefinition>;
  DestinyItemTierTypeDefinition: ManifestEntries<Destiny2.DestinyItemTierTypeDefinition>;
  DestinyPresentationNodeDefinition: ManifestEntries<Destiny2.DestinyPresentationNodeDefinition>;
  DestinyCollectibleDefinition: ManifestEntries<Destiny2.DestinyCollectibleDefinition>;
  DestinyStatDefinition: ManifestEntries<Destiny2.DestinyStatDefinition>;
  DestinyDestinationDefinition: ManifestEntries<Destiny2.DestinyDestinationDefinition>;
  DestinyEquipmentSlotDefinition: ManifestEntries<Destiny2.DestinyEquipmentSlotDefinition>;
  DestinyRecordDefinition: ManifestEntries<Destiny2.DestinyRecordDefinition>;
  DestinyInventoryItemDefinition: ManifestEntries<Destiny2.DestinyInventoryItemDefinition>;
  DestinyMaterialRequirementSetDefinition: ManifestEntries<Destiny2.DestinyMaterialRequirementSetDefinition>;
  DestinyProgressionDefinition: ManifestEntries<Destiny2.DestinyProgressionDefinition>;
  DestinyProgressionLevelRequirementDefinition: ManifestEntries<Destiny2.DestinyProgressionLevelRequirementDefinition>;
  DestinySocketCategoryDefinition: ManifestEntries<Destiny2.DestinySocketCategoryDefinition>;
  DestinyLocationDefinition: ManifestEntries<Destiny2.DestinyLocationDefinition>;
  DestinyLoreDefinition: ManifestEntries<Destiny2.DestinyLoreDefinition>;
  DestinySocketTypeDefinition: ManifestEntries<Destiny2.DestinySocketTypeDefinition>;
  DestinyObjectiveDefinition: ManifestEntries<Destiny2.DestinyObjectiveDefinition>;
  DestinyMilestoneDefinition: ManifestEntries<Destiny2.DestinyMilestoneDefinition>;
  DestinyPlugSetDefinition: ManifestEntries<Destiny2.DestinyPlugSetDefinition>;
  DestinyChecklistDefinition: ManifestEntries<Destiny2.DestinyChecklistDefinition>;
  DestinyHistoricalStatsDefinition: ManifestEntries<Destiny2.DestinyHistoricalStatsDefinition>;
  DestinyActivityModifierDefinition: ManifestEntries<Destiny2.DestinyActivityModifierDefinition>;
  DestinyReportReasonCategoryDefinition: ManifestEntries<Destiny2.DestinyReportReasonCategoryDefinition>;
  DestinyVendorDefinition: ManifestEntries<Destiny2.DestinyReportReasonCategoryDefinition>;
}

interface Manifest extends ManifestItems {
  set: (manifest: ManifestItems) => void;
}

const manifest = {
  set: (newManifest: ManifestItems) => {
    Object.assign(manifest, newManifest);
  }
} as any;

export default manifest as Manifest;
