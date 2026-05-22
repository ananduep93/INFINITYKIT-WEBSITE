import ToolSkeleton from '../../../components/ui/ToolSkeleton';

/**
 * Tool detail page streaming loading UI
 * 
 * Next.js shows this instantly while generateStaticProps / ToolClient
 * hydrates. Using the shared <ToolSkeleton /> component for consistency.
 */
export default function ToolPageLoading() {
  return <ToolSkeleton />;
}
