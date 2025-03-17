import { Document } from '@/types/document';
import { AnalysisRunWithResults, AnalysisRunRequest } from '@/types/analysis/base';
import { documentService } from './document.service';
import { analysisService } from './analysis.service';
import { AnalysisMode } from '@/enums/analysis';

/**
 * Interface for batch processing item
 */
export interface BatchProcessItem {
    id?: string;
    file: File;
    document?: Document;
    analysis?: AnalysisRunWithResults;
    status: 'pending' | 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'failed';
    progress: number;
    error?: string;
}

/**
 * Interface for batch processing options
 */
export interface BatchProcessOptions {
    analysisCode: string;
    mode: AnalysisMode;
    notifyOnCompletion: boolean;
}

/**
 * Batch processing service
 */
class BatchService {
    /**
     * Process a single item in the batch
     * @param item The batch item to process
     * @param options Batch processing options
     * @param onProgress Callback for progress updates
     */
    async processItem(
        item: BatchProcessItem,
        options: BatchProcessOptions,
        onProgress?: (progress: number) => void
    ): Promise<BatchProcessItem> {
        try {
            // Update progress to uploading (33%)
            if (onProgress) onProgress(33);

            // Upload document
            const document = await documentService.uploadDocument(item.file);

            // Update progress to analyzing (66%)
            if (onProgress) onProgress(66);

            // Create analysis request
            const analysisRequest: AnalysisRunRequest = {
                document_id: document.id,
                analysis_code: options.analysisCode,
                mode: options.mode,
                config: {
                    steps: {},
                    notifications: {
                        notify_on_completion: options.notifyOnCompletion,
                        notify_on_failure: true
                    },
                    metadata: {}
                }
            };

            // Start analysis
            const analysisInfo = await analysisService.startAnalysis(
                document.id,
                options.analysisCode,
                options.mode
            );

            // Fetch analysis details
            const analysis = await analysisService.getAnalysis(analysisInfo.id || '');

            // Update progress to completed (100%)
            if (onProgress) onProgress(100);

            // Return updated item
            return {
                ...item,
                document,
                analysis,
                status: 'completed',
                progress: 100
            };
        } catch (error) {
            console.error('Error processing batch item:', error);
            return {
                ...item,
                status: 'failed',
                progress: 0,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Process multiple items in a batch
     * @param items The batch items to process
     * @param options Batch processing options
     * @param onItemProgress Callback for individual item progress updates
     * @param onBatchProgress Callback for overall batch progress updates
     */
    async processBatch(
        items: BatchProcessItem[],
        options: BatchProcessOptions,
        onItemProgress?: (itemId: string, progress: number) => void,
        onBatchProgress?: (progress: number) => void
    ): Promise<BatchProcessItem[]> {
        const results: BatchProcessItem[] = [];
        let completedItems = 0;

        // Process items sequentially to avoid overwhelming the server
        for (const item of items) {
            if (item.status !== 'pending') {
                results.push(item);
                completedItems++;
                continue;
            }

            // Process the item
            const result = await this.processItem(
                item,
                options,
                (progress) => {
                    if (onItemProgress && item.id) {
                        onItemProgress(item.id, progress);
                    }
                }
            );

            results.push(result);
            completedItems++;

            // Update overall batch progress
            if (onBatchProgress) {
                onBatchProgress((completedItems / items.length) * 100);
            }
        }

        return results;
    }
}

export const batchService = new BatchService(); 