/** 分支类型 */
type BranchType = 'feature' | 'release' | 'hotfix' | 'experimental' | 'main';

/** feature 分支 */
interface FeatureBranch extends BaseBranch {
  type: 'feature';
  /** 分支名中类型后面的部分，如 feature/ui-redesign 中的 ui-redesign */
  segment: string;
}

/** release 分支，包含语义化版本号 */
interface ReleaseBranch extends BaseBranch {
  type: 'release';
  /** 分支名中类型后面的部分，如 release/2.55.0 中的 2.55.0 */
  segment: string;
  major: number;
  minor: number;
  patch: number;
}

/** hotfix 分支，包含语义化版本号 */
interface HotfixBranch extends BaseBranch {
  type: 'hotfix';
  /** 分支名中类型后面的部分，如 hotfix/2.55.1 中的 2.55.1 */
  segment: string;
  major: number;
  minor: number;
  patch: number;
}

/** experimental 分支 */
interface ExperimentalBranch extends BaseBranch {
  type: 'experimental';
  /** 分支名中类型后面的部分，如 experimental/xxx 中的 xxx */
  segment: string;
}

/** main 分支 */
interface MainBranch extends BaseBranch {
  type: 'main';
}

/** 分支基础信息 */
interface BaseBranch {
  /** 分支类型 */
  type: BranchType;
  /** 完整分支名，如 feature/ui-redesign、release/2.55.0、main */
  fullName: string;
}

/** 分支联合类型 */
type Branch =
  | FeatureBranch
  | ReleaseBranch
  | HotfixBranch
  | ExperimentalBranch
  | MainBranch;

export type {
  BranchType,
  Branch,
  FeatureBranch,
  ReleaseBranch,
  HotfixBranch,
  ExperimentalBranch,
  MainBranch,
};
